import { Socket } from "socket.io";
import { connectToRedis } from "../db/redis";
import { connectToDb } from "../db/connectToDb";
import { ErrorTypes } from "../errors/ErrorTypes";

export class SongHandler {
  roomId: string;
  socket: Socket;
  queueRedisPrefix: string;

  constructor(socket: Socket, roomId: string) {
    this.roomId = roomId;
    this.socket = socket;
    this.queueRedisPrefix = "queue";
  }

  public addSong = async (songlink: string) => {
    // this.createTable();
    this.songExists(songlink).then((r) => {
      if (r) return;
    });
    const db = await connectToDb();
    await db
      .query("INSERT INTO group_songs(id,songlink,username) VALUES($1,$2,$3)", [
        this.roomId,
        songlink,
        this.socket.id,
      ])
      .then((r) => {
        console.log("dkljfgn:" + r.command);
      })
      .catch((err) => console.error(err));
  };

  public getQueue = async (clearQueue?: boolean) => {
    const db = await connectToDb();
    const redis = await connectToRedis();
    if (clearQueue) this.clearQueueCache();
    db.query("SELECT * FROM group_songs WHERE id=$1 LIMIT 2", [this.roomId])
      .then(async (r) => {
        console.log("rows:" + r.command);
        redis.exists(
          `${this.queueRedisPrefix}:${this.roomId}`,
          async (_err, exi) => {
            if (exi === 1) {
              redis.get(
                `${this.queueRedisPrefix}:${this.roomId}`,
                (err, lkjhdfgbn) => {
                  if (err || lkjhdfgbn === null)
                    return ErrorTypes.GET_QUEUE_ERROR;
                  return lkjhdfgbn;
                }
              );
            }
            try {
              await this.addQueueToCache(r.rows);
              if (clearQueue) {
                await this.removeSong(r.rows[0].songlink);
                await this.removeSong(r.rows[1].songlink);
              }
              const queue = await this.getCachedQueue();
              console.log("q: " + queue);
              return queue;
            } catch (e) {
              //this would possibly throw an indexoutofbounds exception
              if (r.rows.length >= 0 && clearQueue)
                await this.removeSong(r.rows[0].songlink);
              return r.rows[0].songlink;
            }
          }
        );
      })
      .catch((err) => {
        console.error(err);
        return ErrorTypes.GET_QUEUE_ERROR;
      });
    return "mache das oben nicht lol";
  };

  public clearQueueCache = async () => {
    const redis = await connectToRedis();
    redis
      .del(`${this.queueRedisPrefix}:${this.roomId}`)
      .then(() => redis.disconnect())
      .catch((err) => console.error(err));
  };

  public addQueueToCache = async (songs: any[]) => {
    const redis = await connectToRedis();
    redis
      .set(
        `${this.queueRedisPrefix}:${this.roomId}`,
        JSON.stringify(songs),
        "ex",
        86400
      )
      .then(() => redis.disconnect())
      .catch((err) => console.error("set:" + err));
  };

  public getCachedQueue = async () => {
    const redis = await connectToRedis();
    let r = "";
    redis.get(`${this.queueRedisPrefix}:${this.roomId}`, (err, result) => {
      if (err) {
        console.error(err);
        r = ErrorTypes.GET_QUEUE_ERROR;
        return ErrorTypes.GET_QUEUE_ERROR;
      }
      if (result === null || result === "") return ErrorTypes.GET_QUEUE_ERROR;
      console.log("cachedQueue:" + result);
      redis.disconnect();
      r = result;
      return result;
    });
    return r;
  };

  public getSongsInQueue = async (): Promise<number> => {
    const db = await connectToDb();
    let rowCount = 0;
    await db
      .query("SELECT songlink FROM group_songs WHERE id=$1", [this.roomId])
      .then(async (r) => {
        try {
          console.log("r: " + r + " - rowCount: " + r.rowCount);
          rowCount = r.rowCount;
        } catch (err) {
          console.log(err);
          rowCount = ErrorTypes.NO_MORE_SONGS_NUMBER;
        }
      })
      .catch((err) => {
        console.error(err);
      });
    return rowCount;
  };

  private removeSong = async (songlink: string) => {
    if (!this.songExists(songlink)) return;
    const db = await connectToDb();
    await db.query("DELETE FROM group_songs WHERE songlink=$1 AND id=$2", [
      songlink,
      this.roomId,
    ]);
  };

  private songExists = async (songlink: string): Promise<boolean> => {
    const db = await connectToDb();
    let exists = false;
    await db
      .query("SELECT username FROM group_songs WHERE songlink=$1 AND id=$2", [
        songlink,
        this.roomId,
      ])
      .then((res) => {
        if (res.rowCount >= 1) exists = true;
        else exists = false;
      });
    console.log(exists);
    return exists;
  };

  //@ts-ignore
  private createTable = async () => {
    const db = await connectToDb();
    //username would be the socket id in the case
    await db.query(
      "CREATE TABLE group_songs(id varchar(400), songlink varchar(400), username varchar(400))"
    );
  };
}
