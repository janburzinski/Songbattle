import { Socket } from "socket.io";
import { Vote } from "../cache/vote.cache";
import { voteCache } from "../";
import { connectToRedis } from "../db/redis";

export class VoteHandler {
  private roomId: string;
  private socket: Socket;
  private songlink: string;
  private redisName: string;

  constructor(roomId: string, socket: Socket, songlink?: string) {
    this.roomId = roomId;
    this.socket = socket;
    this.songlink = songlink ?? "";
    this.redisName = `vote:${this.roomId}:${this.songlink}`;
  }

  public vote = async (): Promise<boolean> => {
    return new Promise(async (resolve, _reject) => {
      const redis = await connectToRedis();
      if (!voteCache.hasVoted(this.socket.id)) {
        const voteObj = new Vote(this.roomId, this.songlink, this.socket.id);
        voteCache.addVote(voteObj);
        const prevVotes = await this.getVotes();
        await redis
          .set(this.redisName, prevVotes + 1, "ex", 10800)
          .then(() => redis.disconnect());
        resolve(true);
      }
      resolve(false);
    });
  };

  public removeVote = async () => {
    const redis = await connectToRedis();
    redis.del(this.redisName, () => redis.disconnect());
  };

  public getVotes = async (): Promise<number> => {
    return new Promise(async (resolve, _reject) => {
      const redis = await connectToRedis();
      redis.get(this.redisName, (err: any, res: any) => {
        if (err || res === null || res === "") resolve(0);
        try {
          resolve(parseInt(res));
        } catch (err) {
          console.error(err);
          resolve(0);
        }
        redis.disconnect();
      });
    });
  };
}
