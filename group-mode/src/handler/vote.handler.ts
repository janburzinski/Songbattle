import { Socket } from "socket.io";

export class VoteHandler {
  roomId: string;
  socket: Socket;

  constructor(roomId: string, socket: Socket) {
    this.roomId = roomId;
    this.socket = socket;
  }
}
