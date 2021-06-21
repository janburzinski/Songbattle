import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../../utils/connectToDb";
import { generateId } from "../../../../utils/consts";
import format from "pg-format";
import { connectToRedis } from "../../../../utils/connectToRedis";

const redisKey = `freeplay:songs`;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "post") {
    const owner = req.body.owner;
    const id = generateId();
    const secretId = generateId();

    if (typeof owner !== "string") {
      res.status(400).send({
        added: false,
        message: "Bad Input",
      });
      return;
    }
    const db = await connectToDb();
    const redis = await connectToRedis();
    let songs: any = [];

    const exists = await redis.exists(redisKey);
    if (exists) {
      redis.get(redisKey, (err, result) => {
        if (err) console.log(err);
        songs = JSON.parse(result);
      });
    } else {
      //rapcaviar
      const playlist_id = "37i9dQZF1DX0XUsuxWHRQd";
      const playlistItemsFetch = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?market=DE`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${process.env.SPOTIFY_OAUTH_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const playlistSongs = await playlistItemsFetch.json();
      for (let i = 0; i < 50; i++) {
        try {
          //@ts-ignore
          const obj = [
            id,
            playlistSongs.items[i].track.external_urls.spotify,
            owner,
          ];
          //@ts-ignore
          songs.push(obj);
        } catch (err) {
          console.log(err);
        }
      }
      await redis.set(redisKey, JSON.stringify(songs), "ex", 604800); // 1 week
    }

    console.log("songs: " + songs);

    const randomPickedSongs = songs
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    // create room
    await db
      .query("INSERT INTO room(id, owner, secretid) VALUES($1,$2,$3)", [
        id,
        owner,
        secretId,
      ])
      .then(() => {
        db.query("SELECT owner FROM room WHERE id=$1", [id], (err, r) => {
          if (err) {
            res.status(400).send({
              added: false,
              message: "There was an error while creating the freeplay room!",
            });
            return;
          }
          if (r.rowCount >= 1) {
            const query = format(
              "INSERT INTO songs(id, songlink, username) VALUES %L",
              randomPickedSongs
            );
            db.query(query);

            res.send({ id: id, created: true, secretId: secretId });
            return;
          }
          res
            .status(400)
            .send({ added: false, message: "Room does not exist!" });
        });
      })
      .catch((err) =>
        res.status(400).send({ added: false, message: err.stack })
      );
  }
};
