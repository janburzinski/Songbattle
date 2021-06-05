import { Socket } from "socket.io";
import { connectToRedis } from "../db/redis";

export class RoomHandler {
  socket: Socket;
  roomId: string;
  redisPrefix: string;

  constructor(socket: Socket, roomId: string) {
    this.socket = socket;
    this.roomId = roomId ?? "OH OH";
    this.redisPrefix = "room";
  }

  public createRoomCache = async () => {
    const redis = await connectToRedis();
    console.log("roomId:" + this.roomId);
    await redis.set(`${this.redisPrefix}:${this.roomId}`, 1, "ex", 86400); // expire after 1 day
    redis.disconnect();
  };

  public deleteRoomCache = async () => {
    if (this.roomExists()) {
      const redis = await connectToRedis();
      await redis.del(`${this.redisPrefix}:${this.roomId}`);
      redis.disconnect();
    }
  };

  public roomExists = async () => {
    const redis = await connectToRedis();
    return await redis.exists(`${this.redisPrefix}:${this.roomId}`);
  };

  public joinRoom = async () => {
    if (this.roomExists()) {
      const redis = await connectToRedis();
      await redis.incr(`${this.redisPrefix}:${this.roomId}`);
      redis.disconnect();
    }
  };

  public leaveRoom = async () => {
    if (this.roomExists()) {
      const redis = await connectToRedis();
      await redis.decr(`${this.redisPrefix}:${this.roomId}`);
      redis.disconnect();
    }
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
    return userCount;
  };
}
