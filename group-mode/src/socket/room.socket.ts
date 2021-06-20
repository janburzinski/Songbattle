import { RoomHandler } from "../handler/room.handler";
import { Socket } from "socket.io";
import { userHandler } from "../";
import { SongHandler } from "../handler/song.handler";
import { connectToRedis } from "../db/redis";
import { v4 as uuidv4 } from "uuid";

export class RoomSocket {
  private socket: Socket;
  private socketId: string;

  constructor(socket: Socket) {
    this.socket = socket;
    this.socketId = socket.id;
  }

  public init() {
    this.socket.on("join_room", async (data: any) => {
      console.log(this.socket.id + " joined " + data.roomId);
      const roomHandler = new RoomHandler(this.socket, data.roomId);
      await this.socket.join(data.roomId);
      console.log(this.socket.rooms);
      await roomHandler.joinRoom();
      //send update user count signal
      const userCount = await roomHandler.getUserCount();
      this.socket.to(data.roomId).emit("update_user_count", {
        userCount: userCount,
      });
    });

    this.socket.on("leave_room", async (data: any) => {
      console.log("LEAVE_ROOM DSKJHFGNDFLKJHGNDSFLKJGNDFKGNKFDg");
      console.log(this.socket.id + " left " + data.roomId);
      const roomHandler = new RoomHandler(this.socket, data.roomId);
      const userCount = await roomHandler.getUserCount();
      this.socket.to(data.roomId).emit("update_user_count", {
        userCount: userCount,
      });
      this.socket.leave(data.roomId);
      await roomHandler.leaveRoom();
      if (userCount <= 0) {
        console.log("dkfjhgnbgdöflkjg");
        // ?
        this.socket.to(data.roomId).emit("destory_room", {
          text: "Usercount is equal or smaller than 0",
        });
        await roomHandler.deleteRoomCache();
      }
    });

    this.socket.on("disconnect", async () => {
      console.log("socketId:" + this.socketId);
      if (
        userHandler === null ||
        this.socket.id === "undefined" ||
        !userHandler.exists(this.socket.id)
      ) {
        //not good!!!!! NEED TO REWORK
        console.log("disconnect but userhandler or this.socket null");
        this.socket.emit("update_user_count", {
          userCount: 1,
        });
        this.socket.disconnect(true);
        return;
      }
      const roomId = userHandler.users.get(this.socketId);
      const roomHandler = new RoomHandler(this.socket, roomId!);
      console.log("disconnect");
      console.log(this.socketId + " left " + roomId);
      await roomHandler.leaveRoom();
      const userCount = await roomHandler.getUserCount();
      this.socket.to(roomId!).emit("update_user_count", {
        userCount: userCount,
      });
      this.socket.leave(roomId!);
      this.socket.disconnect(true);
      if (this.socket.rooms.size === 0) {
        //TODO: Work out better way to determine size of room
        //await roomHandler.deleteRoomCache();
      }
    });

    this.socket.on("start_game", async (data: any) => {
      console.log("Start Game " + data.roomId);
    });

    this.socket.on("create_room", async (data: any) => {
      console.log(this.socket.id + " created " + data.roomId);
      const roomHandler = new RoomHandler(this.socket, data.roomId);
      roomHandler.createRoomCache();
      this.socket.join(data.roomId);
      //send update user count signal
      const songHandler = new SongHandler(this.socket, data.roomId);
      songHandler.getSongsInQueue().then(async (songCount) => {
        const userCount = await roomHandler.getUserCount();
        this.socket.emit("update_user_count", {
          userCount: userCount,
          songCount: songCount,
        });
      });
    });

    this.socket.on("get_owner_secret_key", async (data: any) => {
      const redis = await connectToRedis();
      const roomId = data.roomId;
      redis.exists(`owner:${roomId}`, async (exists) => {
        if (exists) {
          redis.disconnect();
          return;
        }
        const uuid = uuidv4();
        await redis.set(`owner:${roomId}`, uuid, "ex", 86400);
        this.socket.emit("secret_key", { secret_key: uuid });
        redis.disconnect();
      });
    });
  }
}
