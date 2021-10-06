import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import socketIOClient, { Socket } from "socket.io-client";
import swal from "sweetalert";
import { getCookie, hasCookie } from "../../../utils/consts";

interface WithRouterProps {
  router: NextRouter;
}

interface GroupPlayProps extends WithRouterProps {}

class GroupPlay extends React.Component<GroupPlayProps> {
  public socket: Socket = socketIOClient("http://localhost:8080", {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
  });
  public state = {
    isOwner: false,
    processingVote: false,
    connectedToSocket: false,
    submittedSong: false,
    queue: null,
    songsInQueue: 0,
    vote1Count: 0,
    vote2Count: 0,
    songLink1: "",
    songLink2: "",
  };

  constructor(props) {
    super(props);
    this.submitSong = this.submitSong.bind(this);
  }

  /**
   * TODO: Check the Secret key Cookie
   * Check if the key in cookie is actually correct when going to the next round
   */

  componentDidMount() {
    this.setState({ connectedToSocket: this.socket.connected });
    if (!this.socket.connected) {
      setTimeout(() => {
        this.setState({ connectedToSocket: this.socket.connected });
        this.socket.emit("join_room", {
          roomId: this.props.router.query.roomId,
        });
        this.socket.emit("get_queue", {
          roomId: this.props.router.query.roomId,
        });
        if (hasCookie("secret_key")) this.setState({ isOwner: true });
        this.handleIncomingPayload();
      }, 2000);
    }
  }

  componentWillUnmount() {
    this.socket.emit("leave_room", { roomId: this.props.router.query.roomId });
    this.socket.disconnect();
  }

  public handleIncomingPayload() {
    this.socket.on("start_game", (data: any) => {
      this.props.router.push("/group/play/" + this.props.router.query.roomId);
    });
    this.socket.on("queue", (data: any) => {
      if (
        data.queue === "Error while getting the songs in queue!" ||
        data.queue === null
      ) {
        this.socket.emit("failed_to_request_song", {
          roomId: this.props.router.query.roomId,
        });
        this.socket.emit("redirect_all", {
          roomId: this.props.router.query.roomId,
        });
        swal({
          icon: "error",
          text: "An Error occurred while getting the songs in queue!",
          title: "Error while getting Queue",
        });
        this.props.router.push("/");
        return;
      }
      if (this.state.queue != null)
        this.setState({
          queue: null,
          songsInQueue: 0,
          songLink1: "",
          songLink2: "",
          vote1Count: 0,
          vote2Count: 0,
        });
      if (data.songsInQueue > 1)
        this.setState({
          queue: JSON.parse(data.queue),
          songsInQueue: data.songsInQueue,
          songLink1: JSON.parse(data.queue)[0].songlink,
          songLink2: JSON.parse(data.queue)[1].songlink,
        });
      else
        this.setState({
          queue: JSON.parse(data.queue),
          songsInQueue: data.songsInQueue,
          songLink1: JSON.parse(data.queue)[0].songlink,
          songLink2: "",
        });
    });
    /*this.socket.on("owner_left_room_leave", () => {
      swal({
        icon: "warning",
        title: "Owner left!",
        text: "The Owner left the room! You will be redirected!",
      });
      this.props.router.push("/");
    });*/
    this.socket.on("add_song_success", () => {
      swal({
        icon: "success",
        text: "The Song has been successfully added",
        title: "Successfully added the Song",
      });
    });
    this.socket.on("vote_success", () => {
      this.setState({ processingVote: false });
    });
    this.socket.on("update_vote_count", (data: any) => {
      const songlink = data.songlink;
      const voteCount = data.voteCount;
      const { songLink1 } = this.state;
      if (songlink === songLink1) this.setState({ vote1Count: voteCount });
      else this.setState({ vote2Count: voteCount });
    });
    this.socket.on("redirect_win", () =>
      this.props.router.push("/group/win/" + this.props.router.query.roomId)
    );
    this.socket.on("redirect_all", () => this.props.router.push("/"));
    this.socket.on("destory_room", (data: any) => {
      swal({
        icon: "warning",
        title: "Room destoryed!",
        text: data.text,
      });
      this.props.router.push("/");
    });
    this.socket.on("room_already_exists", (data: any) => {
      swal({
        icon: "warning",
        title: "Room already exists!",
        text: "I don't know how this is possible but it happened",
      });
      this.props.router.push("/");
    });
  }

  submitSong(e) {
    e.preventDefault();
    if (this.socket === null) {
      swal({
        icon: "warning",
        title: "Socket not connected!",
        text: "Connection to the socket was lost! Please reload the page!",
      });
    }
    this.socket.emit("add_song", {
      roomId: this.props.router.query.roomId,
      songlink: e.target.songlink.value,
    });
  }

  vote1 = async () => {
    this.socket.emit("vote", {
      roomId: this.props.router.query.roomId,
      songlink: this.state.songLink1,
    });
    this.setState({ processingVote: true });
  };

  vote2 = async () => {
    this.socket.emit("vote", {
      roomId: this.props.router.query.roomId,
      songlink: this.state.songLink2,
    });
    this.setState({ processingVote: true });
  };

  nextRound = async () => {
    const { vote1Count, vote2Count, songsInQueue, songLink1, songLink2 } =
      this.state;
    const roomId = this.props.router.query.roomId;
    let losingSong: string;
    //determine who won
    if (vote1Count > vote2Count) {
      this.socket.emit("song_win", {
        songlink: songLink1,
        roomId: roomId,
        remove: songLink2,
      });
      losingSong = songLink2;
    } else if (vote2Count > vote1Count) {
      this.socket.emit("song_win", {
        songlink: songLink1,
        roomId: roomId,
        remove: songLink1,
      });
      losingSong = songLink1;
    } else {
      const randomInt = ~~(Math.random() * 1) + 2;
      if (randomInt === 1) {
        this.socket.emit("song_win", {
          songlink: songLink1,
          roomId: roomId,
          remove: songLink2,
        });
        losingSong = songLink2;
      } else {
        this.socket.emit("song_win", {
          songlink: songLink2,
          roomId: roomId,
          remove: songLink1,
        });
        swal({
          icon: "info",
          title: "Randomly picking a song!",
          text: "Random picking a song because its 50/50",
          timer: 10000,
        });
        losingSong = songLink1;
      }
    }
    if (songsInQueue - 1 <= 1) {
      this.props.router.push("/group/win/" + roomId);
      this.socket.emit("win_redirect", {
        roomId: roomId,
        songlink: losingSong,
        otherSong: losingSong === songLink1 ? songLink2 : songLink1,
      });
      return;
    }
    this.socket.emit("get_next_queue", {
      roomId: this.props.router.query.roomId,
      songlink: losingSong,
      otherSong: losingSong === songLink1 ? songLink2 : songLink1,
    });
  };

  render() {
    const {
      songLink1,
      songLink2,
      songsInQueue,
      queue,
      processingVote,
      vote1Count,
      vote2Count,
      isOwner,
    } = this.state;
    return (
      <div className="dark:bg-gray-800">
        <Head>
          <title>Songbattle - In Game</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-800">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                {songsInQueue != 0 ? `Songs in Queue: ${songsInQueue - 2}` : ""}
              </h2>
            </div>
            <div>
              {queue != null ? (
                <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                  <iframe
                    src={"https://open.spotify.com/embed/track/" + songLink1}
                    width="300"
                    height="80"
                    frameBorder="0"
                    allow="encrypted-media"
                  ></iframe>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={this.vote1}
                  >
                    {vote1Count} VOTES
                  </button>
                  <br />
                  <iframe
                    src={"https://open.spotify.com/embed/track/" + songLink2}
                    width="300"
                    height="80"
                    frameBorder="0"
                    allow="encrypted-media"
                  ></iframe>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={this.vote2}
                  >
                    {vote2Count} VOTES
                  </button>
                </p>
              ) : (
                <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                  Loading...
                </p>
              )}
              {processingVote ? (
                <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                  Processing Vote...
                </p>
              ) : (
                ""
              )}
              <br />
              <br />
              {isOwner ? (
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={this.nextRound}
                >
                  Next Round
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(GroupPlay);
