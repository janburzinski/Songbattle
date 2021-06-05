import Head from "next/head";
import { NextRouter, useRouter, withRouter } from "next/router";
import { url } from "../../utils/consts";
import React, { useEffect, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";

interface WithRouterProps {
  router: NextRouter;
}

interface GroupWaitingProps extends WithRouterProps {}

class GroupWaiting extends React.Component<GroupWaitingProps> {
  public state = {
    usersInQueue: 0,
    connectedToSocket: false,
  };
  public socket: Socket = socketIOClient("http://localhost:8080", {
    transports: ["websocket"],
  });

  //TODO: Check the Cookie

  componentDidMount() {
    this.setState({ connectedToSocket: this.socket.connected });
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

  componentWillUnmount() {
    this.socket.emit("leave_room", { roomId: this.props.router.query.roomId });
    this.socket.disconnect();
  }

  public handleIncomingPayload() {
    this.socket.on("update_user_count", (data: any) => {
      this.setState({ usersInQueue: Number(data.userCount) });
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
              <a
                href={url + "/queue/" + roomId}
                className="mt-6 text-center text-1xl font-extrabold text-gray-400"
              >
                {url + "/queue/" + roomId}
              </a>
              <button
                type="submit"
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
