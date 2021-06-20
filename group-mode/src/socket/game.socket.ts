import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SongHandler } from "../handler/song.handler";
import { VoteHandler } from "../handler/vote.handler";

export class GameSocket {
  private socket: Socket;
  private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

  constructor(
    socket: Socket,
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>
  ) {
    this.socket = socket;
    this.io = io;
  }

  public init() {
    this.socket.on("win_redirect", async (data: any) => {
      const otherSong = data.otherSong;
      const losingSnog = data.songlink;
      const voteHandler = new VoteHandler(data.roomId, this.socket, otherSong);
      const songHandler = new SongHandler(this.socket, data.roomId);
      await voteHandler.removeVote();
      await songHandler.removeSong(
        "https://open.spotify.com/track/" + losingSnog
      );
      this.socket.to(data.roomId).emit("redirect_win");
    });
    this.socket.on("get_queue", async (data: any) => {
      const songHandler = new SongHandler(this.socket, data.roomId);
      const queue = await songHandler.getQueue();
      const songsInQueue = await songHandler.getSongsInQueue();
      console.log("queue: " + queue);
      this.socket
        .to(data.roomId)
        .emit("queue", { queue: queue, songsInQueue: songsInQueue });
      this.socket.emit("queue", { queue: queue, songsInQueue: songsInQueue });
    });

    this.socket.on("get_next_queue", async (data: any) => {
      const songHandler = new SongHandler(this.socket, data.roomId);
      const songThatLost = "https://open.spotify.com/track/" + data.songlink;
      const otherSong = data.otherSong;
      const voteHandler = new VoteHandler(data.roomId, this.socket, otherSong);
      console.log("songThatLost: " + songThatLost);
      //remove song from postgresql
      await songHandler.removeSong(songThatLost);
      //remove the votes from the songs
      await voteHandler.removeVote();
      await voteHandler.removeVote(data.songlink);
      const songsInQueue = await songHandler.getSongsInQueue();
      //emit new queue
      const socketIds = await this.io.in(data.roomId).allSockets();
      const queue = await songHandler.getQueue(true, socketIds);
      console.log("new queue: " + queue);
      this.socket
        .to(data.roomId)
        .emit("queue", { queue: queue, songsInQueue: songsInQueue });
      this.socket.emit("queue", { queue: queue, songsInQueue: songsInQueue });
    });

    /**
     * Vote
     */
    this.socket.on("vote", async (data: any) => {
      const roomId = data.roomId;
      console.log("roomId:" + roomId);
      const songlink = data.songlink;
      const voteHandler = new VoteHandler(roomId, this.socket, songlink);
      const vote = await voteHandler.vote();
      //TODO: Delete other song
      const voteCount = await voteHandler.getVotes();
      if (vote) {
        this.socket.to(data.roomId).emit("update_vote_count", {
          songlink: songlink,
          voteCount: voteCount,
        });
        this.socket.emit("update_vote_count", {
          songlink: songlink,
          voteCount: voteCount,
        });
      }

      this.socket.emit("vote_success");
    });
  }
}
