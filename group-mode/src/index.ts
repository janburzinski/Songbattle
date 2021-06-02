import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const main = async () => {
  io.on("connection", (socket: Socket) => {});

  server.listen(8080, () => console.log("Listening on Port 8080"));
};

main().catch((err) => console.error(err));
