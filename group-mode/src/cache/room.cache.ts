import { connectToDb } from "../db/connectToDb";

export class Room {
  id: string;
  owner: string;
  secertId: string;

  constructor(roomId: string, owner?: string, secretId?: string) {
    this.id = roomId;
    this.owner = owner ?? "Owner not set";
    this.secertId = secretId ?? "SecretId not set";
  }

  public getId(): string {
    return this.id;
  }

  public getOwner(): string {
    return this.owner;
  }

  public getSecretId(): string {
    return this.secertId;
  }
}

export class RoomCache {
  public rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map<string, Room>();
  }

  public syncCache = async () => {
    const db = await connectToDb();
    console.log("Syncing Rooms to local Cache");
    await db.query("SELECT * FROM groups").then((r) => {
      for (let i = 0; i < r.rows.length; i++) {
        const room = new Room(
          r.rows[i].id,
          r.rows[i].owner,
          r.rows[i].secretid
        );
        this.rooms.set(r.rows[i].id, room);
      }
    });
    console.log("Synced " + this.rooms.size + " Rooms to local Cache");
  };

  public addRoomToCache = async (room: Room) => {
    this.rooms.set(room.id, room);
  };

  public removeRoomFromCache = async (roomId: string) => {
    this.rooms.delete(roomId);
  };

  public getRoom = async (roomId: string) => {
    console.log(this.rooms.get(roomId)?.id);
    return this.rooms.get(roomId);
  };

  public isCached = async (roomId: string) => {
    return this.rooms.has(roomId);
  };
}
