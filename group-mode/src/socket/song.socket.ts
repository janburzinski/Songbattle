import { SongHandler } from "../handler/song.handler";
import { Socket } from "socket.io";
import { ErrorTypes } from "../errors/ErrorTypes";
import { UserHandler } from "../handler/user.handler";

export class SongSocket {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public init() {
    this.socket.on("add_song", async (data: any) => {
      const songHandler = new SongHandler(this.socket, data.roomId);
      await songHandler.addSong(data.songlink);
      console.log(data.songlink + " - " + data.roomId);
      this.socket.emit("add_song_success");
      const songCount = await songHandler.getSongsInQueue();
      console.log("songCount: " + songCount);
      this.socket.to(data.roomId).emit("update_song_count", {
        songCount: songCount,
      });
    });

    this.socket.on("start_game", async (data: any) => {
      const roomId = data.roomId;
      const secretKey = data.secretKey;
      const userHandler = new UserHandler();
      const correctKey = await userHandler.checkSecretKey(secretKey, roomId);
      if (!correctKey) return;
      const songHandler = new SongHandler(this.socket, data.roomId);
      const songCount = await songHandler.getSongsInQueue();
      console.log("songCount startGame: " + songCount);
      if (songCount % 2 != 0 || songCount === 0) {
        this.socket.emit("start_game_error", {
          error: ErrorTypes.NOT_ENOUGH_SONGS_IN_QUEUE,
          errorTitle: "Not enough Songs in Queue",
        });
        return;
      }
      this.socket.emit("start_game_redirect");
      this.socket.to(roomId).emit("start_game", { roomId: roomId });
    });
  }
}
