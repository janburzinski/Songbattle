import "reflect-metadata";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { RoomHandler } from "./handler/room.handler";
import { SongHandler } from "./handler/song.handler";
import { UserHandler } from "./handler/user.handler";
import { RoomCache } from "./cache/room.cache";
import { ErrorTypes } from "./errors/ErrorTypes";
import { VoteCache } from "./cache/vote.cache";
import { VoteHandler } from "./handler/vote.handler";
import { connectToRedis } from "./db/redis";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
export let userHandler: UserHandler;
export let roomCache: RoomCache;
export let voteCache: VoteCache;

/**
 * TODO: Socket Authetication
 * TODO: make redis timneout times consistent
 */

const main = async () => {
  userHandler = new UserHandler();
  roomCache = new RoomCache();
  voteCache = new VoteCache();
  await roomCache.syncCache();

  io.on("connection", (socket: Socket) => {
    const socketId = socket.id;
    console.log(socket.id + " connected!");

    /**
     * Win
     */
    socket.on("win_redirect", (data: any) => {
      socket.to(data.roomId).emit("redirect_win");
    });
    /**
     * Owner
     */
    socket.on("get_owner_secret_key", async (data: any) => {
      const redis = await connectToRedis();
      const roomId = data.roomId;
      redis.exists(`owner:${roomId}`, (exists) => {
        if (exists) {
          redis.disconnect();
          return;
        }
        const uuid = uuidv4();
        redis
          .set(`owner:${roomId}`, uuid, "ex", 86400)
          .then(() => redis.disconnect());
        socket.emit("secret_key", { secret_key: uuid });
      });
    });

    /**
     * Game
     */

    socket.on("get_queue", async (data: any) => {
      const songHandler = new SongHandler(socket, data.roomId);
      const queue = await songHandler.getQueue();
      const songsInQueue = await songHandler.getSongsInQueue();
      console.log("queue: " + queue);
      socket
        .to(data.roomId)
        .emit("queue", { queue: queue, songsInQueue: songsInQueue });
      socket.emit("queue", { queue: queue, songsInQueue: songsInQueue });
    });

    socket.on("get_next_queue", async (data: any) => {
      const songHandler = new SongHandler(socket, data.roomId);
      const songLink1 = data.songlink1;
      const songLink2 = data.songlink2;
      await songHandler.removeSong(songLink1);
      await songHandler.removeSong(songLink2);
      const songsInQueue = await songHandler.getSongsInQueue();
      const queue = songHandler.getQueue(true);
      //remove everyone from vote cache
      socket
        .to(data.roomId)
        .emit("queue", { queue: queue, songsInQueue: songsInQueue });
      socket.emit("queue", { queue: queue, songsInQueue: songsInQueue });
    });

    /**
     * Vote
     */
    socket.on("vote", async (data: any) => {
      const roomId = data.roomId;
      console.log("roomId:" + roomId);
      const songlink = data.songlink;
      const voteHandler = new VoteHandler(roomId, socket, songlink);
      const vote = await voteHandler.vote();
      //TODO: Delete other song
      const voteCount = await voteHandler.getVotes();
      if (vote) {
        socket.to(data.roomId).emit("update_vote_count", {
          songlink: songlink,
          voteCount: voteCount,
        });
        socket.emit("update_vote_count", {
          songlink: songlink,
          voteCount: voteCount,
        });
      }

      socket.emit("vote_success");
    });

    /**
     * Songs
     */
    socket.on("add_song", async (data: any) => {
      const songHandler = new SongHandler(socket, data.roomId);
      await songHandler.addSong(data.songlink);
      console.log(data.songlink + " - " + data.roomId);
      socket.emit("add_song_success");
      const songCount = await songHandler.getSongsInQueue();
      console.log("songCount: " + songCount);
      socket.to(data.roomId).emit("update_song_count", {
        songCount: songCount,
      });
    });

    socket.on("start_game", async (data: any) => {
      const roomId = data.roomId;
      const songHandler = new SongHandler(socket, data.roomId);
      const songCount = await songHandler.getSongsInQueue();
      console.log("songCount startGame: " + songCount);
      if (songCount % 2 != 0 || songCount === 0) {
        socket.emit("start_game_error", {
          error: ErrorTypes.NOT_ENOUGH_SONGS_IN_QUEUE,
          errorTitle: "Not enough Songs in Queue",
        });
        return;
      }
      socket.emit("start_game_redirect");
      socket.to(roomId).emit("start_game", { roomId: roomId });
    });

    /**
     * Room Management
     */
    socket.on("join_room", async (data: any) => {
      console.log(socket.id + " joined " + data.roomId);
      const roomHandler = new RoomHandler(socket, data.roomId);
      await socket.join(data.roomId);
      console.log(socket.rooms);
      await roomHandler.joinRoom();
      //send update user count signal
      const userCount = await roomHandler.getUserCount();
      socket.to(data.roomId).emit("update_user_count", {
        userCount: userCount,
      });
    });

    socket.on("leave_room", async (data: any) => {
      console.log("LEAVE_ROOM DSKJHFGNDFLKJHGNDSFLKJGNDFKGNKFDg");
      console.log(socket.id + " left " + data.roomId);
      const roomHandler = new RoomHandler(socket, data.roomId);
      const userCount = await roomHandler.getUserCount();
      socket.to(data.roomId).emit("update_user_count", {
        userCount: userCount,
      });
      socket.leave(data.roomId);
      await roomHandler.leaveRoom();
      if (socket.rooms.size === 0) {
        await roomHandler.deleteRoomCache();
        //TODO: Delete Entry from Postgres
      }
    });

    socket.on("disconnect", async () => {
      console.log("socketId:" + socketId);
      if (
        userHandler === null ||
        socket.id === "undefined" ||
        !userHandler.exists(socket.id)
      ) {
        //not good!!!!! NEED TO REWORK
        console.log("disconnect but userhandler or socket null");
        socket.emit("update_user_count", {
          userCount: 1,
        });
        socket.disconnect(true);
        return;
      }
      const roomId = userHandler.users.get(socketId);
      const roomHandler = new RoomHandler(socket, roomId!);
      console.log("disconnect");
      console.log(socketId + " left " + roomId);
      await roomHandler.leaveRoom();
      const userCount = await roomHandler.getUserCount();
      socket.to(roomId!).emit("update_user_count", {
        userCount: userCount,
      });
      socket.leave(roomId!);
      socket.disconnect(true);
      if (socket.rooms.size === 0) {
        await roomHandler.deleteRoomCache();
        //TODO: Delete Entry from Postgres
      }
    });

    socket.on("start_game", async (data: any) => {
      console.log("Start Game " + data.roomId);
    });

    socket.on("create_room", async (data: any) => {
      console.log(socket.id + " created " + data.roomId);
      const roomHandler = new RoomHandler(socket, data.roomId);
      roomHandler.createRoomCache();
      socket.join(data.roomId);
      //send update user count signal
      const songHandler = new SongHandler(socket, data.roomId);
      songHandler.getSongsInQueue().then(async (songCount) => {
        const userCount = await roomHandler.getUserCount();
        socket.emit("update_user_count", {
          userCount: userCount,
          songCount: songCount,
        });
      });

      socket.on("owner_left_room", async (data: any) => {
        console.log("OWNER LEFT ROOM ÄLJNSDFGLKJHNSDGDFKLJMGN");
        const roomHandler = new RoomHandler(socket, data.roomId);
        socket.to(data.roomId).emit("owner_left_room_leave");
        roomHandler.deleteRoomCache();
        //TODO: Delete Entry in Postgres
      });
    });
  });
  io.setMaxListeners(0);
  server.listen(8080, () => console.log("Listening on Port 8080"));
};

main().catch((err) => console.error(err));
