import { Socket } from "socket.io";
import { connectToRedis } from "../db/redis";
import { userHandler } from "../index";

export class RoomHandler {
  public socket: Socket;
  private roomId: string;
  private redisPrefix: string;

  constructor(socket: Socket, roomId: string | null) {
    this.socket = socket;
    this.roomId = roomId ?? userHandler.users.get(socket.id)!;
    this.redisPrefix = "room";
  }

  public createRoomCache = async () => {
    const redis = await connectToRedis();
    console.log("roomId:" + this.roomId);
    await redis.set(`${this.redisPrefix}:${this.roomId}`, 1, "ex", 86400); // expire after 1 day
    userHandler.addSocketIdToList(this.socket.id, this.roomId);
    userHandler.addOwner(this.socket.id, this.roomId);
    redis.disconnect();
  };

  public deleteRoomCache = async () => {
    if (!this.roomExists()) return;
    const redis = await connectToRedis();
    await redis.del(`${this.redisPrefix}:${this.roomId}`);
    userHandler.removeSocketIdFromList(this.socket.id);
    redis.disconnect();
  };

  public roomExists = async () => {
    const redis = await connectToRedis();
    let exists = 0;
    redis.exists(`${this.redisPrefix}:${this.roomId}`, (err, r) => {
      if (err) exists = 1;
      exists = r;
    });
    redis.disconnect();
    return exists;
  };

  public joinRoom = async () => {
    if (!this.roomExists()) return;
    const redis = await connectToRedis();
    userHandler.addSocketIdToList(this.socket.id, this.roomId);
    await redis.incr(`${this.redisPrefix}:${this.roomId}`);
    redis.disconnect();
  };

  public leaveRoom = async () => {
    if (!this.roomExists()) return;
    const redis = await connectToRedis();
    await redis.decr(`${this.redisPrefix}:${this.roomId}`);
    userHandler.removeSocketIdFromList(this.socket.id);
    redis.disconnect();
  };

  public getUserCount = async (): Promise<string> => {
    const redis = await connectToRedis();
    let userCount: string = "1";
    await redis.get(`${this.redisPrefix}:${this.roomId}`).then((result) => {
      if (result === null) return userCount;
      if (result === "") return userCount;
      userCount = result!;
      console.log("userCountResult:" + result);
      return result;
    });
    redis.disconnect();
    return userCount;
  };
}
