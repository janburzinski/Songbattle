import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { RoomHandler } from "./handler/room.handler";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const main = async () => {
  io.on("connection", (socket: Socket) => {
    const roomHandler = new RoomHandler(socket);
    io.on("join_room", (roomId: string) => {
      socket.join(roomId);
      roomHandler.joinRoom(roomId);
    });
    io.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      roomHandler.leaveRoom(roomId);
    });
    io.on("create_room", (roomId: string) => {
      const roomHandler = new RoomHandler(socket);
      roomHandler.createRoomCache(roomId);
    });
  });
  server.listen(8080, () => console.log("Listening on Port 8080"));
};

main().catch((err) => console.error(err));
