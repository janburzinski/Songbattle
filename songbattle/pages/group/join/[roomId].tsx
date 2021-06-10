import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import React from "react";
import socketIOClient, { Socket } from "socket.io-client";
import swal from "sweetalert";
import { socketURL } from "../../../utils/consts";

interface WithRouterProps {
  router: NextRouter;
}

interface GroupWaitingProps extends WithRouterProps {}

class GroupWaiting extends React.Component<GroupWaitingProps> {
  public socket: Socket = socketIOClient("http://localhost:8080", {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
  });
  public state = {
    connectedToSocket: false,
    submittedSong: false,
    gameStarted: false,
  };

  constructor(props) {
    super(props);
    this.submitSong = this.submitSong.bind(this);
  }

  //TODO: Check the Cookie

  componentDidMount() {
    this.setState({ connectedToSocket: this.socket.connected });
    if (!this.socket.connected) {
      setTimeout(() => {
        console.log(this.socket.connected);
        this.setState({ connectedToSocket: this.socket.connected });
        this.socket.emit("join_room", {
          roomId: this.props.router.query.roomId,
        });
      }, 2000);
    }
  }

  componentWillUnmount() {
    if (!this.state.gameStarted) {
      this.socket.emit("leave_room", {
        roomId: this.props.router.query.roomId,
      });
      this.socket.disconnect();
    }
  }

  public handleIncomingPayload() {
    this.socket.on("start_game", (data: any) => {
      this.props.router.push("/group/play/" + this.props.router.query.roomId);
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
    this.socket.on("queue", (data: any) => {
      if (data.queue === "Error while getting the songs in queue!") {
        swal({
          icon: "error",
          text: "An Error occurred while getting the songs in queue!",
          title: "Error while getting Queue",
        });
        //maybe dispatch to server and try again or delete?
      }
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

  render() {
    const { roomId } = this.props.router.query;
    this.handleIncomingPayload();
    return (
      <div className="dark:bg-gray-800">
        <Head>
          <title>Songbattle - Group:{roomId}</title>
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
              {this.state.submittedSong ? (
                <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                  Waiting for the Owner to start...
                </p>
              ) : (
                <form
                  className="mt-8 space-y-6"
                  action="#"
                  method="POST"
                  onSubmit={this.submitSong}
                >
                  <p className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Group Waiting Room
                  </p>
                  <div>
                    <label htmlFor="songlink" className="sr-only">
                      Songlink
                    </label>
                    <input
                      id="songlink"
                      name="songlink"
                      type="text"
                      autoComplete="text"
                      className="dark:bg-gray-800 dark:text-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Songlink"
                    />
                  </div>
                  <div>
                    <div className="flex flex-row">
                      <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        CREATE
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(GroupWaiting);
