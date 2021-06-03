import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { RoomHandler } from "./room/room.handler";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const main = async () => {
  io.on("connection", (socket: Socket) => {
    const roomHandler = new RoomHandler(socket);
    console.log("connected " + socket.id);
    socket.emit("Test", "Penis");
  });

  io.on("create_room", (socket: Socket) => {
    const roomHandler = new RoomHandler(socket);
    roomHandler.createRoomCache();
  });

  server.listen(8080, () => console.log("Listening on Port 8080"));
};

main().catch((err) => console.error(err));
