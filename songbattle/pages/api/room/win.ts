import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";
import { getPreview } from "spotify-url-info";
import { connectToRedis } from "../../../utils/connectToRedis";
import { Client } from "pg";
import { Redis } from "ioredis";

const updateRedis = async (redis: Redis, db: Client) => {
  db.query("SELECT * FROM stats ORDER BY wins DESC LIMIT 10").then(
    async (r) => {
      await redis.set("leaderboard", JSON.stringify(r.rows));
    }
  );
};

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "post") {
    const songUrl = req.body.songUrl;
    const id = req.body.id;

    if (typeof songUrl !== "string" || typeof id !== "string") {
      res.status(400).send({
        updated: false,
        message: "Bad Input",
      });
      return;
    }
    const db = await connectToDb();
    const redis = await connectToRedis();
    /*await db.query("DROP TABLE stats");
    await db.query(
      "CREATE TABLE stats(songname varchar(400), cover_img varchar(400), wins int, artist varchar(400), rankChange varchar(400))"
    );*/

    db.query("SELECT songlink FROM songs WHERE id=$1", [id])
      .then((a) => {
        // room has less or equal 1 song in the queue
        if (a.rowCount <= 1) {
          // actual mark the song as the song that won
          getPreview(songUrl)
            .then(async (data) => {
              const songTitle = data.title;
              const songImage = data.image;

              db.query("SELECT wins FROM stats WHERE songname=$1", [
                songTitle,
              ]).then(async (r) => {
                if (r.rowCount > 0) {
                  const wins = r.rows[0].wins;
                  await db.query("UPDATE stats SET wins=$1 WHERE songname=$2", [
                    Number(wins) + 1,
                    songTitle,
                  ]);
                  await updateRedis(redis, db);
                  res.send({ updated: true });
                  res.end();
                  return;
                } else {
                  await db
                    .query(
                      "INSERT INTO stats(songname, cover_img, wins, artist) VALUES($1,$2,$3,$4)",
                      [songTitle, songImage, 1, data.artist]
                    )
                    .then(async (r) => {
                      await updateRedis(redis, db);
                      res.send({ updated: true });
                    })
                    .catch((err) => {
                      res
                        .status(400)
                        .send({ updated: false, message: err.stack });
                    });
                  return;
                }
              });
            })
            .catch((err) =>
              res.status(400).send({ updated: false, message: err.stack })
            );
          return;
        }
        res.status(400).send({
          error: true,
          message: "There are too many songs still in the queue!",
        });
        return;
      })
      .catch((err) =>
        res
          .status(400)
          .send({ deleted: false, error: true, message: err.stack })
      );
  }
};
