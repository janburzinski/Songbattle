import { Socket } from "socket.io";
import { connectToDb } from "../db/connectToDb";
import { ErrorTypes } from "../errors/ErrorTypes";

export class SongHandler {
  roomId: string;
  socket: Socket;

  constructor(socket: Socket, roomId: string) {
    this.roomId = roomId;
    this.socket = socket;
  }

  public addSong = async (songlink: string) => {
    // this.createTable();
    this.songExists(songlink)
      .then(async (r) => {
        if (r) return; //exists so return
        const db = await connectToDb();
        db.query(
          "INSERT INTO group_songs(id,songlink,username) VALUES($1,$2,$3)",
          [this.roomId, songlink, this.socket.id]
        ).then((r) => {
          console.log("dkljfgn:" + r);
        });
      })
      .catch((err) => console.error(err));
    console.log(songlink);
  };

  public getQueue = async () => {
    const db = await connectToDb();
    await db
      .query("SELECT * FROM group_songs WHERE id=$1 LIMIT 2", [this.roomId])
      .then(async (r) => {
        console.log(r.rows);
        try {
          await this.removeSong(r.rows[0].songlink);
          await this.removeSong(r.rows[1].songlink);
          return r.rows;
        } catch (e) {
          return ErrorTypes.NO_MORE_SONGS;
        }
      })
      .catch((err) => {
        console.error(err);
      });
    return ErrorTypes.GET_QUEUE_ERROR;
  };

  public getSongsInQueue = async (): Promise<number> => {
    const db = await connectToDb();
    let rowCount = 0;
    await db
      .query("SELECT * FROM group_songs WHERE id=$1", [this.roomId])
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

  private songExists = async (songlink: string) => {
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
