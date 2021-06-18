const RoomCache = require("../room.cache");
let roomId = "";
let owner = "";
let secretId = "";

const generate = () => {
  return (
    new Date().getTime().toString(36) + Math.random().toString(36).slice(2)
  );
};

describe("Room Cache", () => {
  beforeEach(() => {
    roomId = generate();
    owner = generate();
    secretId = generate();
  });

  afterEach(() => {
    roomId = "";
    (owner = ""), (secretId = "");
  });

  test("add room to cache", async () => {
    const roomCache = new RoomCache.RoomCache();
    await roomCache.addRoomToCache(new RoomCache.Room(roomId, owner, secretId));
    const isCached = await roomCache.isCached(roomId);
    const r = await roomCache.getRoom(roomId);
    expect(isCached).toBe(true);
    expect(roomCache.rooms.size).toBe(1);
  });

  test("add room to cache and check data", async () => {
    const roomCache = new RoomCache.RoomCache();
    const room = new RoomCache.Room(roomId, owner, secretId);
    await roomCache.addRoomToCache(room);
    const exists = await roomCache.isCached(roomId);
    const r = await roomCache.getRoom(roomId);
    expect(exists).toBe(true);
    expect(roomCache.rooms.size).toBe(1);
    expect(r.owner).toBe(owner);
    expect(r.secertId).toBe(secretId);
    expect(r.id).toBe(roomId);
  });

  test("add room to cache and remove it", async () => {
    const roomCache = new RoomCache.RoomCache();
    const room = new RoomCache.Room(roomId, owner, secretId);
    await roomCache.addRoomToCache(room);
    const r = await roomCache.getRoom(roomId);
    const exists1 = await roomCache.isCached(roomId);
    await roomCache.removeRoomFromCache(roomId);
    const exists2 = await roomCache.isCached(roomId);

    expect(exists1).toBe(true);
    expect(exists2).toBe(false);
    expect(roomCache.rooms.size).toBe(0);
    expect(r.owner).toBe(owner);
    expect(r.secertId).toBe(secretId);
    expect(r.id).toBe(roomId);
  });
});
