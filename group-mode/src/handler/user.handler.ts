/**
 * find the roomid by socketid
 */
export class UserHandler {
  public users: Map<string, string>;
  public owners: Map<string, string>;

  constructor() {
    this.users = new Map<string, string>();
    this.owners = new Map<string, string>();
  }

  public addSocketIdToList = async (socketId: string, roomId: string) => {
    if (this.users.has(socketId)) return;
    this.users.set(socketId, roomId);
    console.log("added:" + this.users.get(socketId) + " - " + socketId);
  };

  public removeSocketIdFromList = async (socketId: string) => {
    if (this.users.has(socketId)) this.users.delete(socketId);
    console.log("remove " + socketId);
  };

  public exists = async (socketId: string) => {
    console.log("socketId exists: " + this.users.has(socketId));
    return this.users.has(socketId);
  };

  public addOwner = async (socketId: string, roomId: string) => {
    if (this.owners.has(socketId)) return;
    this.owners.set(socketId, roomId);
    console.log("added owner: " + this.owners.get(socketId) + " - " + socketId);
  };

  public removeOwner = async (socketId: string) => {
    if (!this.owners.has(socketId)) return;
    this.owners.delete(socketId);
  };

  public isOwner = async (socketId: string) => {
    return this.owners.has(socketId);
  };

  public clearList = () => {
    this.users.clear();
  };

  public clearOwnerList = () => {
    this.owners.clear();
  };
}
