import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { RoomHandler } from "./handler/room.handler";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const main = async () => {
  io.on("connection", (socket: Socket) => {
    console.log(socket.id + " connected!");
    console.log(socket.rooms);
    socket.on("join_room", async (data: any) => {
      const roomHandler = new RoomHandler(socket, data.roomId);
      socket.join(data.roomId);
      roomHandler.joinRoom();
      //send update user count signal
      socket.emit("update_user_count", {
        userCount: await roomHandler.getUserCount(),
      });
    });
    socket.on("leave_room", (data: any) => {
      const roomHandler = new RoomHandler(socket, data.roomId);
      socket.leave(data.roomId);
      roomHandler.leaveRoom();
    });
    socket.on("create_room", async (data: any) => {
      const roomHandler = new RoomHandler(socket, data.roomId);
      roomHandler.createRoomCache();
      socket.join(data.roomId);
      //send update user count signal
      socket.emit("update_user_count", {
        userCount: await roomHandler.getUserCount(),
      });
    });
  });
  io.setMaxListeners(10000000);
  server.listen(8080, () => console.log("Listening on Port 8080"));
};

main().catch((err) => console.error(err));
