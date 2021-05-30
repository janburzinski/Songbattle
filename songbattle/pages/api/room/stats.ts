import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";
import { connectToRedis } from "../../../utils/connectToRedis";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "get") {
    const db = await connectToDb();
    const redis = await connectToRedis();

    /*db.query("DROP TABLE stats");
    db.query(
      "CREATE TABLE stats(songname varchar(400), cover_img varchar(400), wins int, artist varchar(400))"
    );*/

    db.query("SELECT * FROM stats ORDER BY wins DESC LIMIT 10")
      .then(async (r) => {
        if (await redis.exists("leaderboard")) {
          await redis.get("leaderboard").then(async (r) => {
            res.status(200).send({ info: JSON.parse(r) });
            redis.disconnect();
          });
          return;
        }
        await redis
          .set("leaderboard", JSON.stringify(r.rows))
          .then(async () => {
            res.status(200).send({ info: r.rows });
            redis.disconnect();
          })
          .catch((err) => {
            res.status(400).send({ error: true, message: err });
            redis.disconnect();
          });
      })
      .catch((err) =>
        res.status(400).send({ added: false, message: err.stack })
      );
  }
};
