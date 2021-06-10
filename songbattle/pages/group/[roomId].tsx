import Head from "next/head";
import { NextRouter, useRouter, withRouter } from "next/router";
import { socketURL, url } from "../../utils/consts";
import React, { useEffect, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import swal from "sweetalert";

interface WithRouterProps {
  router: NextRouter;
}

interface GroupWaitingProps extends WithRouterProps {}

class GroupWaiting extends React.Component<GroupWaitingProps> {
  public state = {
    songsInQueue: 0,
    usersInQueue: 0,
    connectedToSocket: false,
    gameStarted: false,
  };
  public socket: Socket = socketIOClient("http://localhost:8080", {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
  });

  constructor(props) {
    super(props);
    this.startGame = this.startGame.bind(this);
  }

  //TODO: Check the Cookie

  componentDidMount() {
    this.setState({ connectedToSocket: this.socket.connected });
    this.setupBeforeUnloadListener();
    if (!this.socket.connected) {
      setTimeout(() => {
        console.log(this.socket.connected);
        this.setState({ connectedToSocket: this.socket.connected });
        this.socket.emit("create_room", {
          roomId: this.props.router.query.roomId,
        });
      }, 2000);
    }
  }

  private setupBeforeUnloadListener() {
    window.addEventListener("beforeunload", (ev) => {
      ev.preventDefault();
      return this.disconnect();
    });
  }

  private disconnect() {
    if (!this.state.gameStarted)
      this.socket.emit("leave_room", {
        roomId: this.props.router.query.roomId,
      });
  }

  componentWillUnmount() {
    this.socket.emit("owner_left_room", {
      roomId: this.props.router.query.roomId,
    });
    this.socket.disconnect();
  }

  public handleIncomingPayload() {
    this.socket.on("update_user_count", (data: any) => {
      this.setState({ usersInQueue: parseInt(data.userCount) });
      if (data.songCount != this.state.songsInQueue && data.songCount != null)
        this.setState({ songsInQueue: data.songCount });
    });
    this.socket.on("update_song_count", (data: any) => {
      this.setState({ songsInQueue: parseInt(data.songCount) });
    });
    this.socket.on("start_game_error", (data: any) => {
      swal({
        icon: "error",
        title: data.errorTitle,
        text: data.error,
      });
    });
    this.socket.on("start_game_redirect", () =>
      this.props.router.push("/group/play/" + this.props.router.query.roomId)
    );
  }

  private startGame() {
    const roomId = this.props.router.query.roomId;
    console.log("dkfjgndfjklgndfkjgndfkjg");
    if (this.socket === null) return;
    this.socket.emit("start_game", {
      roomId: roomId,
    });
  }

  render() {
    const { roomId } = this.props.router.query;
    this.handleIncomingPayload();
    return (
      <div className="dark:bg-gray-800">
        <Head>
          <title>Songbattle - Waiting for songs...</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-800">
          <div className="max-w-md w-full space-y-8">
            {!this.state.connectedToSocket ? (
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Connecting to Socket...
              </p>
            ) : (
              ""
            )}
            <div>
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                {this.state.usersInQueue}
              </p>
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                {this.state.usersInQueue === 1
                  ? "User in Queue"
                  : "Users in Queue"}
              </p>
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                {this.state.songsInQueue}
              </p>
              <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                {this.state.songsInQueue === 1
                  ? "Song in Queue"
                  : "Songs in Queue"}
              </p>
              <a
                href={url + "/group/join/" + roomId}
                className="mt-6 text-center text-1xl font-extrabold text-gray-400"
              >
                {url + "/group/join/" + roomId}
              </a>
              <button
                type="submit"
                onClick={this.startGame}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                START
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(GroupWaiting);
