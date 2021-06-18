const UserHandler = require("../user.handler");
let socketId = "lkjsdfhgbgsdljkhfgblijzsdbgoz8";
let roomId = "roomIdroomIdroomIdroomId123";

const generate = () => {
  return (
    new Date().getTime().toString(36) + Math.random().toString(36).slice(2)
  );
};

beforeEach(() => {
  socketId = generate();
  roomId = generate();
});

test("add socket id to list", async () => {
  const userHandler = new UserHandler.UserHandler();
  await userHandler.addSocketIdToList(socketId, roomId);
  const socketIdExists = await userHandler.exists(socketId);
  expect(socketIdExists).toBe(true);
  expect(userHandler.users.size).toBe(1);
});

test("add socket id to list and remove it", async () => {
  const userHandler = new UserHandler.UserHandler();
  await userHandler.addSocketIdToList(socketId);
  const exists1 = await userHandler.exists(socketId);
  userHandler.removeSocketIdFromList(socketId);
  const exists2 = await userHandler.exists(socketId);

  expect(exists1).toBe(true);
  expect(exists2).toBe(false);
  expect(userHandler.users.size).toBe(0);
});

test("add owner to list", async () => {
  const userHandler = new UserHandler.UserHandler();
  await userHandler.addOwner(socketId, roomId);
  const exists = await userHandler.isOwner(socketId);
  expect(exists).toBe(true);
  expect(userHandler.owners.size).toBe(1);
});

test("add owner to list and remove him", async () => {
  const userHandler = new UserHandler.UserHandler();
  await userHandler.addOwner(socketId, roomId);
  const exists1 = await userHandler.isOwner(socketId);
  userHandler.removeOwner(socketId);
  const exists2 = await userHandler.isOwner(socketId);

  expect(exists1).toBe(true);
  expect(exists2).toBe(false);
  expect(userHandler.owners.size).toBe(0);
});

test("clear users map", () => {
  const userHandler = new UserHandler.UserHandler();
  for (let i = 0; i < 5; i++)
    userHandler.addSocketIdToList(generate(), generate());
  userHandler.clearList();
  expect(userHandler.users.size).toBe(0);
});

test("clear owner map", () => {
  const userHandler = new UserHandler.UserHandler();
  for (let i = 0; i < 5; i++) userHandler.addOwner(generate(), generate());
  userHandler.clearOwnerList();
  expect(userHandler.users.size).toBe(0);
});
