import { Socket } from "socket.io";
import { connectToRedis } from "../db/redis";

export class RoomHandler {
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public createRoomCache = async (roomId: string) => {
    if (this.roomExists(roomId)) return;
    const redis = await connectToRedis();
    await redis.set(`room:${roomId}`, 1, "ex", 86400); // expire after 1 day
    redis.disconnect();
  };

  public deleteRoomCache = async (roomId: string) => {
    if (this.roomExists(roomId)) {
      const redis = await connectToRedis();
      await redis.del(`room:${roomId}`);
      redis.disconnect();
    }
  };

  public roomExists = async (roomId: string) => {
    const redis = await connectToRedis();
    return await redis.exists(`room:${roomId}`);
  };

  public joinRoom = async (roomId: string) => {
    if (this.roomExists(roomId)) {
      const redis = await connectToRedis();
      await redis.incr(`room:${roomId}`);
      redis.disconnect();
    }
  };

  public leaveRoom = async (roomId: string) => {
    if (this.roomExists(roomId)) {
      const redis = await connectToRedis();
      await redis.decr(`room:${roomId}`);
      redis.disconnect();
    }
  };

  public getUserCount = async (roomId: string) => {
    const redis = await connectToRedis();
    return await redis.get(`room:${roomId}`);
  };
}
