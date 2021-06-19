const { connectToRedis } = require("../../db/redis");
const { connectToDb } = require("../../db/connectToDb");
const RoomCache = require("../../cache/room.cache");
const UserHandler = require("../user.handler");
let roomId;
let socketId;

const generate = () => {
  return (
    new Date().getTime().toString(36) + Math.random().toString(36).slice(2)
  );
};

describe("Room Handler", () => {
  beforeEach(() => {
    roomId = generate();
    socketId = generate();
  });

  test("test database connection", async () => {
    const redis = await connectToRedis();
    const postgres = await connectToDb();
    let error = null;
    postgres.connect((err) => {
      error = err;
    });
    redis.connect(() => {
      const status1 = redis.status;
      redis.disconnect();
      expect(redis).toBeDefined();
      expect(status1).toBe("connecting");
      expect(error).toBe(null);
    });
  });

  test("create room cache", async () => {
    const redis = await connectToRedis();
    const redisStatus = redis.status;
    const roomCache = new RoomCache.RoomCache();
    const userHandler = new UserHandler.UserHandler();
    const isAlreadyCached = await roomCache.isCached(roomId);
    await redis.set(`TEST:room:${roomId}`, 1, "ex", 86400); // expire after 1 day
    userHandler.addSocketIdToList(socketId, roomId);
    userHandler.addOwner(socketId, roomId);
    roomCache.addRoomToCache(new RoomCache.Room(roomId, socketId));
    console.log("socketId: " + socketId);
    const exists = await roomCache.isCached(roomId);
    const redisEntry = await redis.get(`TEST:room:${roomId}`);
    redis.disconnect();

    expect(isAlreadyCached).toBeFalsy();
    expect(redis).toBeDefined();
    expect(redisStatus).toBe("connecting");
    expect(exists).toBeTruthy();
    expect(userHandler.users.size).toBe(1);
    expect(userHandler.owners.size).toBe(1);
    expect(parseInt(redisEntry)).toEqual(1);
  });
});
