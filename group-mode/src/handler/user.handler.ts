import { connectToRedis } from "../db/redis";

/**
 * find the roomid by socketid
 */
export class UserHandler {
  public users: Map<string, string>;
  public owners: Map<string, string>;

  constructor() {
    this.users = new Map<string, string>();
    this.owners = new Map<string, string>();
  }

  public addSocketIdToList = async (socketId: string, roomId: string) => {
    if (this.users.has(socketId)) return;
    this.users.set(socketId, roomId);
  };

  public removeSocketIdFromList = async (socketId: string) => {
    if (this.users.has(socketId)) this.users.delete(socketId);
  };

  public exists = async (socketId: string) => {
    return this.users.has(socketId);
  };

  public addOwner = async (socketId: string, roomId: string) => {
    if (this.owners.has(socketId)) return;
    this.owners.set(socketId, roomId);
  };

  public removeOwner = async (socketId: string) => {
    if (!this.owners.has(socketId)) return;
    this.owners.delete(socketId);
  };

  public isOwner = async (socketId: string) => {
    return this.owners.has(socketId);
  };

  public checkSecretKey = async (
    secretKey: string,
    roomId: string
  ): Promise<boolean> => {
    const redis = await connectToRedis();
    return new Promise((resolve, _reject) => {
      redis.get(`owner:${roomId}`, (err, res) => {
        if (err) resolve(false);
        if (res === secretKey) resolve(true);
        resolve(false);
      });
    });
  };

  public clearList = () => {
    this.users.clear();
  };

  public clearOwnerList = () => {
    this.owners.clear();
  };
}
