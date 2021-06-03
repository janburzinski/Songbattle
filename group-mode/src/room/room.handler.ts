import { Socket } from "socket.io";
import { connectToRedis } from "../db/redis";

export class RoomHandler {
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public createRoomCache = async () => {
    if (this.roomExists()) return;
    const redis = await connectToRedis();
    // 1 stands for the users in the room
    await redis.set(`room:${this.socket.id}`, 1);
  };

  public deleteRoomCache = async () => {};

  public roomExists = async () => {};

  public addUser = async (username: string) => {};

  public getUsers = async () => {};
}
