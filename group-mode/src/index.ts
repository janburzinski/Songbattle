import "reflect-metadata";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { RoomHandler } from "./handler/room.handler";
import { SongHandler } from "./handler/song.handler";
import { UserHandler } from "./handler/user.handler";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
export const userHandler: UserHandler = new UserHandler();

/**
 * TODO: Socket Authetication
 */

const main = async () => {
  io.on("connection", (socket: Socket) => {
    const socketId = socket.id;
    console.log(socket.id + " connected!");

    /**
     * Song Queue
     */
    socket.on("add_song", async (data: any) => {
      const songHandler = new SongHandler(socket, data.roomId);
      await songHandler.addSong(data.songlink);
      console.log(data.songlink + " - " + data.roomId);
      socket.emit("add_song_success");
      songHandler.getSongsInQueue().then((songCount) => {
        console.log("songCount: " + songCount);
        socket.to(data.roomId).emit("update_song_count", {
          songCount: songCount,
        });
      });
    });

    socket.on("get_songs", async (data: any) => {
      const roomId = data.roomId;
      const songHandler = new SongHandler(socket, roomId);
      songHandler.getQueue().then((songs) => {
        socket.to(roomId).emit("songs", { songs: songs });
      });
    });

    socket.on("start_game", async (data: any) => {
      const roomId = data.roomId;
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
