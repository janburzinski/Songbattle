import { Socket } from "socket.io";
import { connectToRedis } from "../db/redis";
import { connectToDb } from "../db/connectToDb";
import { ErrorTypes } from "../errors/ErrorTypes";

export class SongHandler {
  private roomId: string;
  public socket: Socket;
  private queueRedisPrefix: string;
  private redisName: string;

  constructor(socket: Socket, roomId: string) {
    this.roomId = roomId;
    this.socket = socket;
    this.queueRedisPrefix = "queue";
    this.redisName = `${this.queueRedisPrefix}:${this.roomId}`;
  }

  public addSong = async (songlink: string) => {
    // this.createTable();
    const songAlreadyInQueue = await this.songExists(songlink);
    if (songAlreadyInQueue) return;
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
    return new Promise((resolve, reject) => {
      if (clearQueue) this.clearQueueCache();
      redis.exists(this.redisName, async (err, exists) => {
        if (err) {
          console.error(err);
          reject(ErrorTypes.GET_QUEUE_ERROR);
          return;
        }
        if (exists) {
          const cachedQueue = await this.getCachedQueue();
          resolve(cachedQueue);
          return;
        }
        db.query(
          "SELECT * FROM group_songs WHERE id=$1 LIMIT 2",
          [this.roomId],
          async (err, result) => {
            if (err) {
              console.error(err);
              reject(ErrorTypes.GET_QUEUE_ERROR);
            }
            const song1 = result.rows[0].songlink
              .replace("https://open.spotify.com/embed/track/", "")
              .replace("https://open.spotify.com/track/", "");
            let song2: string = "";
            if (result.rowCount > 1)
              song2 = result.rows[1].songlink
                .replace("https://open.spotify.com/embed/track/", "")
                .replace("https://open.spotify.com/track/", "");
            console.log("song1:" + song1);
            console.log("song1:" + song2);
            if (result.rowCount <= 1)
              return resolve(
                JSON.stringify([{ songlink: song1, id: result.rows[0].id }])
              );
            resolve(
              JSON.stringify([
                { songlink: song1, id: result.rows[0].id },
                { songlink: song2, id: result.rows[1].id },
              ])
            );
          }
        );
      });
    });
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
    return new Promise((resolve, reject) => {
      redis.get(`${this.queueRedisPrefix}:${this.roomId}`, (err, result) => {
        if (err) {
          console.error(err);
          reject(ErrorTypes.GET_QUEUE_ERROR);
        }
        if (result === null || result === "")
          reject(ErrorTypes.GET_QUEUE_ERROR);
        console.log("cachedQueue:" + result);
        redis.disconnect();
        resolve(result);
      });
    });
  };

  public getSongsInQueue = async (): Promise<number> => {
    const db = await connectToDb();
    return new Promise((resolve, _reject) => {
      db.query("SELECT songlink FROM group_songs WHERE id=$1", [this.roomId])
        .then(async (r) => {
          try {
            console.log("r: " + r + " - rowCount: " + r.rowCount);
            resolve(r.rowCount);
          } catch (err) {
            console.log(err);
            resolve(ErrorTypes.NO_MORE_SONGS_NUMBER);
          }
        })
        .catch((err) => {
          console.error(err);
          resolve(ErrorTypes.NO_MORE_SONGS_NUMBER);
        });
    });
  };

  /**
   * TODO: Add Bulk -> make it possible to delete multiple songs in 1 query
   */
  public removeSong = async (songlink: string) => {
    const exists = await this.songExists(songlink);
    if (exists) return;
    const db = await connectToDb();
    await db.query("DELETE FROM group_songs WHERE songlink=$1 AND id=$2", [
      songlink,
      this.roomId,
    ]);
  };

  private songExists = async (songlink: string): Promise<boolean> => {
    const db = await connectToDb();
    return new Promise((resolve, _reject) => {
      db.query("SELECT username FROM group_songs WHERE songlink=$1 AND id=$2", [
        songlink,
        this.roomId,
      ]).then((res) => resolve(res.rowCount >= 1 ? true : false));
    });
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
