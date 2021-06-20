import "reflect-metadata";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { UserHandler } from "./handler/user.handler";
import { RoomCache } from "./cache/room.cache";
import { VoteCache } from "./cache/vote.cache";
import { RoomSocket } from "./socket/room.socket";
import { GameSocket } from "./socket/game.socket";
import { SongSocket } from "./socket/song.socket";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
export let userHandler: UserHandler;
export let roomCache: RoomCache;
export let voteCache: VoteCache;

/**
 * TODO: Socket Authetication
 */

const main = async () => {
  userHandler = new UserHandler();
  roomCache = new RoomCache();
  voteCache = new VoteCache();
  await roomCache.syncCache();

  io.on("connection", (socket: Socket) => {
    console.log(socket.id + " connected!");

    const roomSocket = new RoomSocket(socket);
    roomSocket.init();

    const gameSocket = new GameSocket(socket, io);
    gameSocket.init();

    const songSocket = new SongSocket(socket);
    songSocket.init();
  });
  io.setMaxListeners(0);
  server.listen(8080, () => console.log("Listening on Port 8080"));
};

main().catch((err) => console.error(err));
