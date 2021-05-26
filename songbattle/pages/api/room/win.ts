import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";
import { getPreview } from "spotify-url-info";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "post") {
    const songUrl = req.body.songUrl;

    if (typeof songUrl !== "string") {
      res.status(400).send({
        updated: false,
        message: "Bad Input",
      });
      return;
    }
    const db = await connectToDb();
    //await db.query("DROP TABLE stats");
    /*await db.query(
       "CREATE TABLE stats(songname varchar(400), cover_img varchar(400), wins varchar(400), artist varchar(400))"
     );*/

    getPreview(songUrl).then(async (data) => {
      const songTitle = data.title;
      const songImage = data.image;
      db.query("SELECT wins FROM stats WHERE songname=$1", [songTitle]).then(
        async (r) => {
          console.log("rowCount:" + r.rowCount);
          if (r.rowCount > 0) {
            const wins = r.rows[0].wins;
            console.log(Number(wins) + 1);
            await db.query("UPDATE stats SET wins=$1 WHERE songname=$2", [
              Number(wins) + 1,
              songTitle,
            ]);
            return;
          } else {
            await db
              .query(
                "INSERT INTO stats(songname, cover_img, wins, artist) VALUES($1,$2,$3,$4)",
                [songTitle, songImage, 1, data.artist]
              )
              .then(() => res.send({ updated: true }))
              .catch((err) =>
                res.status(400).send({ updated: false, message: err.stack })
              );
            return;
          }
        }
      );
    });
  }
};
