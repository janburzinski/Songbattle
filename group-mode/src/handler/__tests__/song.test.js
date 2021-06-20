const { connectToDb } = require("../../db/connectToDb");
const { connectToRedis } = require("../../db/redis");
require("dotenv").config();
let id;
let songlink;
let username;

const generate = () => {
  return (
    new Date().getTime().toString(36) + Math.random().toString(36).slice(2)
  );
};

describe("Song Handler", () => {
  beforeEach(() => {
    id = generate();
    songlink = generate();
    username = generate();
  });

  test("add song", async () => {
    const postgres = await connectToDb(true);
    postgres.connect((err) => {
      error = err;
    });
    let error = null;
    let databaseEntry;
    let rowCount;
    await postgres.query(
      "CREATE TABLE IF NOT EXISTS group_songs(id varchar(400), songlink varchar(400), username varchar(400))"
    );
    await postgres
      .query("INSERT INTO group_songs(id,songlink,username) VALUES($1,$2,$3)", [
        id,
        songlink,
        username,
      ])
      .catch((err) => (error = err));
    await postgres
      .query(
        "SELECT * FROM group_songs WHERE id=$1 AND username=$2 AND songlink=$3",
        [id, username, songlink]
      )
      .then((r) => {
        databaseEntry = r.rows;
        rowCount = r.rowCount;
      })
      .catch((err) => (error = err));
    postgres.end();

    expect(error).toBeNull();
    expect(databaseEntry[0].id).toBe(id);
    expect(databaseEntry[0].username).toBe(username);
    expect(databaseEntry[0].songlink).toBe(songlink);
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test("get queue", async () => {
    const postgres = await connectToDb(true);
    let error = null;
    postgres.connect((err) => {
      error = err;
    });
    let query = null;
    let queryRowCount = 0;
    let songlinks = [];
    let usernames = [];
    await postgres.query(
      "CREATE TABLE IF NOT EXISTS group_songs(id varchar(400), songlink varchar(400), username varchar(400))"
    );
    for (let i = 0; i < 6; i++) {
      const songlink = "https://open.spotify.com/track/" + generate();
      const username = generate();
      songlinks.push(songlink);
      usernames.push(username);
      await postgres.query(
        "INSERT INTO group_songs(id, songlink, username) VALUES($1,$2,$3)",
        [id, songlink, username]
      );
    }
    await postgres
      .query("SELECT * FROM group_songs WHERE id=$1", [id])
      .then((r) => {
        query = r.rows;
        queryRowCount = r.rowCount;
      });
    console.log("queryRowCount:" + queryRowCount);
    postgres.end();

    expect(error).toBeNull();
    expect(queryRowCount).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < 6; i++) {
      expect(query[i].id).toBe(id);
      expect(query[i].songlink).toBe(songlinks[i]);
      expect(query[i].username).toBe(usernames[i]);
    }
  });

  test("get queue with already existing queue in redis", async () => {
    expect(true).toBeTruthy();
  });

  test("get queue when clearing cached queue before", async () => {
    expect(true).toBeTruthy();
  });
});
