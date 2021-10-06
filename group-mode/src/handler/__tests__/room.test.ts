import { RoomCache, Room } from "../../cache/room.cache";
import { connectToDb } from "../../db/connectToDb";
import { connectToRedis } from "../../db/redis";
import { UserHandler } from "../user.handler";

describe("Room Handler", () => {
  let roomId: string, owner: string, socketId: string;

  const generate = () => {
    return (
      new Date().getTime().toString(36) + Math.random().toString(36).slice(2)
    );
  };

  beforeEach(() => {
    roomId = generate();
    socketId = generate();
    owner = generate();
  });

  test("test database connection", async () => {
    const redis = await connectToRedis();
    const postgres = await connectToDb(true);
    let error: any = null;
    postgres.connect((err: any) => {
      error = err;
    });
    redis.connect(() => {
      const status1 = redis.status;
      postgres.end();
      redis.disconnect();
      expect(redis).toBeDefined();
      expect(status1).toBe("connecting");
      expect(error).toBeNull();
    });
  });

  test("create room cache", async () => {
    const redis = await connectToRedis();
    const postgres = await connectToDb(true);
    let error: any = null;
    postgres.connect((err: any) => {
      error = err;
    });
    const redisStatus = redis.status;
    const roomCache = new RoomCache();
    const userHandler = new UserHandler();
    const isAlreadyCached = await roomCache.isCached(roomId);
    await redis.set(`TEST:room:${roomId}`, 1, "ex", 86400); // expire after 1 day
    await postgres.query(
      "CREATE TABLE IF NOT EXISTS groups(id varchar(400) UNIQUE, owner varchar(400))"
    );
    await postgres.query("INSERT INTO groups(id, owner) VALUES($1,$2)", [
      roomId,
      owner,
    ]);
    userHandler.addSocketIdToList(socketId, roomId);
    userHandler.addOwner(socketId, roomId);
    roomCache.addRoomToCache(new Room(roomId, socketId));
    console.log("socketId: " + socketId);
    const exists = await roomCache.isCached(roomId);
    const redisEntry = await redis.get(`TEST:room:${roomId}`);
    postgres.end();
    redis.disconnect();

    expect(isAlreadyCached).toBeFalsy();
    expect(redis).toBeDefined();
    expect(redisStatus).toBe("connecting");
    expect(exists).toBeTruthy();
    expect(userHandler.users.size).toBe(1);
    expect(roomCache.rooms.size).toBe(1);
    expect(userHandler.owners.size).toBe(1);
    expect(parseInt(redisEntry!)).toEqual(1);
    expect(error).toBeNull();
  });

  test("create room cache and delete it", async () => {
    const redis = await connectToRedis();
    const postgres = await connectToDb(true);
    let error: any = null;
    postgres.connect((err: any) => {
      error = err;
    });
    const redisStatus = redis.status;
    const roomCache = new RoomCache();
    const userHandler = new UserHandler();
    const isAlreadyCached = await roomCache.isCached(roomId);
    let postgresEntry: any;
    await postgres.query(
      "CREATE TABLE IF NOT EXISTS groups(id varchar(400) UNIQUE, owner varchar(400))"
    );
    await redis.set(`TEST:room:${roomId}`, 1, "ex", 86400); // expire after 1 day
    await postgres.query("INSERT INTO groups(id, owner) VALUES($1,$2)", [
      roomId,
      owner,
    ]);
    await postgres
      .query("SELECT * FROM groups WHERE id=$1", [roomId])
      .then((r: any) => {
        postgresEntry = r.rows;
      });
    userHandler.addSocketIdToList(socketId, roomId);
    userHandler.addOwner(socketId, roomId);
    roomCache.addRoomToCache(new Room(roomId, socketId));
    const roomSize = roomCache.rooms.size;
    const usersSize = userHandler.users.size;
    const ownerSize = userHandler.owners.size;
    console.log("socketId: " + socketId);
    const exists = await roomCache.isCached(roomId);
    const redisEntryBefore = await redis.get(`TEST:room:${roomId}`);
    await redis.del(`TEST:room:${roomId}`);
    userHandler.removeSocketIdFromList(socketId);
    userHandler.removeOwner(socketId);
    roomCache.removeRoomFromCache(roomId);
    const redisEntry = await redis.get(`TEST:room:${roomId}`);
    await postgres.query("DELETE FROM groups WHERE id=$1", [roomId]);
    const existsAfter = await roomCache.isCached(roomId);
    postgres.end();
    redis.disconnect();

    expect(isAlreadyCached).toBeFalsy();
    expect(redis).toBeDefined();
    expect(redisStatus).toBe("connecting");
    expect(exists).toBeTruthy();
    expect(existsAfter).toBeFalsy();
    expect(usersSize).toBe(1);
    expect(ownerSize).toBe(1);
    expect(roomSize).toBe(1);
    expect(userHandler.users.size).toBe(0);
    expect(userHandler.owners.size).toBe(0);
    expect(roomCache.rooms.size).toBe(0);
    expect(parseInt(redisEntryBefore!)).toBe(1);
    expect(parseInt(redisEntry!)).toBeNaN();
    expect(postgresEntry).toBeDefined();
    expect(postgresEntry[0].id).toBe(roomId);
    expect(postgresEntry[0].owner).toBe(owner);
    expect(error).toBeNull();
  });

  test("join room", async () => {
    const redis = await connectToRedis();
    const redisStatus = redis.status;
    const roomCache = new RoomCache();
    const userHandler = new UserHandler();
    const isAlreadyCached = await roomCache.isCached(roomId);
    await redis.set(`TEST:room:${roomId}`, 1, "ex", 86400); // expire after 1 day
    const redisEntryBefore = await redis.get(`TEST:room:${roomId}`);
    userHandler.addSocketIdToList(socketId, roomId);
    userHandler.addOwner(socketId, roomId);
    roomCache.addRoomToCache(new Room(roomId, socketId));
    console.log("socketId: " + socketId);
    const exists = await roomCache.isCached(roomId);
    //simulate user join
    const socketIdFromUser = generate();
    userHandler.addSocketIdToList(socketIdFromUser, roomId);
    await redis.incr(`TEST:room:${roomId}`);
    const redisEntry = await redis.get(`TEST:room:${roomId}`);
    redis.disconnect();

    expect(isAlreadyCached).toBeFalsy();
    expect(redis).toBeDefined();
    expect(redisStatus).toBe("connecting");
    expect(exists).toBeTruthy();
    expect(userHandler.users.size).toBe(2);
    expect(roomCache.rooms.size).toBe(1);
    expect(userHandler.owners.size).toBe(1);
    expect(parseInt(redisEntryBefore!)).toEqual(1);
    expect(parseInt(redisEntry!)).toEqual(2);
  });

  test("leave room", async () => {
    const redis = await connectToRedis();
    const redisStatus = redis.status;
    const roomCache = new RoomCache();
    const userHandler = new UserHandler();
    const isAlreadyCached = await roomCache.isCached(roomId);
    await redis.set(`TEST:room:${roomId}`, 1, "ex", 86400); // expire after 1 day
    const redisEntryBefore = await redis.get(`TEST:room:${roomId}`);
    userHandler.addSocketIdToList(socketId, roomId);
    userHandler.addOwner(socketId, roomId);
    roomCache.addRoomToCache(new Room(roomId, socketId));
    console.log("socketId: " + socketId);
    const exists = await roomCache.isCached(roomId);
    //simulate user join
    const socketIdFromUser = generate();
    userHandler.addSocketIdToList(socketIdFromUser, roomId);
    const usersBefore = userHandler.users.size;
    await redis.incr(`TEST:room:${roomId}`);
    const redisEntry = await redis.get(`TEST:room:${roomId}`);
    //simulate user leave
    userHandler.removeSocketIdFromList(socketIdFromUser);
    await redis.decr(`TEST:room:${roomId}`);
    const redisEntryAfter = await redis.get(`TEST:room:${roomId}`);
    redis.disconnect();

    expect(isAlreadyCached).toBeFalsy();
    expect(redis).toBeDefined();
    expect(redisStatus).toBe("connecting");
    expect(exists).toBeTruthy();
    expect(usersBefore).toBe(2);
    expect(userHandler.users.size).toBe(1);
    expect(roomCache.rooms.size).toBe(1);
    expect(userHandler.owners.size).toBe(1);
    expect(parseInt(redisEntryBefore!)).toEqual(1);
    expect(parseInt(redisEntry!)).toEqual(2);
    expect(parseInt(redisEntryAfter!)).toEqual(1);
  });

  test("create secret key and check it", async () => {
    const redis = await connectToRedis();
    const status = redis.status;
    const userHandler = new UserHandler();
    //in the actual code its a uuid
    const key = generate();
    await redis.set(`owner:${roomId}`, key, "ex", 1000);
    const checkKey = await userHandler.checkSecretKey(key, roomId);
    redis.disconnect();
    expect(checkKey).toBeTruthy();
    expect(status).toBe("connecting");
  });
});
