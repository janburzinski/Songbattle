import { Socket } from "socket.io";
import { Room } from "../cache/room.cache";
import { connectToDb } from "../db/connectToDb";
import { connectToRedis } from "../db/redis";
import { roomCache, userHandler } from "../index";

export class RoomHandler {
  public socket: Socket;
  private roomId: string;
  private redisPrefix: string;
  private redisName: string;

  constructor(socket: Socket, roomId: string | null) {
    this.socket = socket;
    this.roomId = roomId ?? userHandler.users.get(socket.id)!;
    this.redisPrefix = "room";
    this.redisName = `${this.redisPrefix}:${this.roomId}`;
  }

  public createRoomCache = async () => {
    if (roomCache.isCached(this.roomId)) {
      this.socket.emit("room_already_exists");
      this.socket.to(this.roomId).emit("room_already_exists");
      return;
    }
    const redis = await connectToRedis();
    console.log("roomId:" + this.roomId);
    await redis.set(this.redisName, 1, "ex", 86400); // expire after 1 day
    userHandler.addSocketIdToList(this.socket.id, this.roomId);
    userHandler.addOwner(this.socket.id, this.roomId);
    roomCache.addRoomToCache(new Room(this.roomId, this.socket.id));
    redis.disconnect();
    console.log("socketId: " + this.socket.id);
  };

  public deleteRoomCache = async () => {
    if (!this.roomExists()) return;
    console.log("iudfghnb dlfjkhgbdfslhkjbfdhg");
    const redis = await connectToRedis();
    await redis.del(this.redisName);
    userHandler.removeSocketIdFromList(this.socket.id);
    userHandler.removeOwner(this.socket.id);
    roomCache.removeRoomFromCache(this.roomId);
    await this.deleteRoom();
    redis.disconnect();
  };

  public deleteRoom = async () => {
    const db = await connectToDb();
    await db.query("DELETE FROM groups WHERE id=$1", [this.roomId]);
  };

  public roomExists = async () => {
    const redis = await connectToRedis();
    return new Promise((resolve, _reject) => {
      redis.exists(this.redisName, (err, r) => {
        if (err) resolve(true);
        resolve(r === 1 ? true : false);
        redis.disconnect();
      });
    });
  };

  public joinRoom = async () => {
    if (!this.roomExists()) return;
    const redis = await connectToRedis();
    userHandler.addSocketIdToList(this.socket.id, this.roomId);
    await redis.incr(this.redisName);
    await redis.expire(this.redisName, 86400);
    redis.disconnect();
  };

  public leaveRoom = async () => {
    if (!this.roomExists()) return;
    const redis = await connectToRedis();
    await redis.decr(this.redisName);
    await redis.expire(this.redisName, 86400);
    userHandler.removeSocketIdFromList(this.socket.id);
    redis.disconnect();
  };

  public getUserCount = async (): Promise<number> => {
    const redis = await connectToRedis();
    let userCount: number = 1;
    return new Promise((resolve, _reject) => {
      redis.get(this.redisName).then((result) => {
        if (result === null || result === "") return resolve(userCount);
        console.log("userCountResult: " + result);
        try {
          resolve(parseInt(result!) + 1);
        } catch (err) {
          console.error(err);
          resolve(userCount);
        }
        redis.disconnect();
      });
    });
  };
}
