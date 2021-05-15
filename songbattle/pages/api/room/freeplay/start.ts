import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../../utils/connectToDb";
import { generateId } from "../../../../utils/consts";

export default async (req: VercelRequest, res: VercelResponse) => {
  const owner = req.body.owner;
  const id = generateId();

  /**
   * Todo: Define Request Method (if possible) and maybe add some form of authentication
   */

  if (typeof owner !== "string") {
    res.status(400).send({
      added: false,
      message: "Bad Input",
    });
    return;
  }
  const db = await connectToDb();
  const songs = [
    "https://open.spotify.com/track/2IePEfMAtqWS6rLXXFZIgI?si=c549e9fe7bab48ea",
    "https://open.spotify.com/track/1HyZhieUhfrHnI2xhC8Ujz?si=c70d638836324d37",
    "https://open.spotify.com/track/14mc78ctIxHOMYz5fWja7Q?si=ef49b9a1965046af",
    "https://open.spotify.com/track/0xAY7oG6h1YBv0Tvc8eUnu?si=755cb05cf9724425",
    "https://open.spotify.com/track/4zb2Qicw1hoIaQ6Lg7BqjK?si=c9571aee71984461",
    "https://open.spotify.com/track/0cf6Z2QLqShle0CQQeK9Do?si=f3ad0b72164b40c8",
    "https://open.spotify.com/track/1D3z6HTiQsNmZxjl7F7eoG?si=b4c56ebd535a4e3c",
    "https://open.spotify.com/track/40mjsnRjCpycdUw3xhS20g?si=1c036513fba5482d",
    "https://open.spotify.com/track/4G8SyOXJeXXzi3u9xT9GUx?si=a73546b7f4ab4547",
    "https://open.spotify.com/track/43PGPuHIlVOc04jrZVh9L6?si=74892a7d6cc8466d",
  ];

  await db
    .query("INSERT INTO room(id, owner) VALUES($1,$2)", [id, owner])
    .catch((err) => res.status(400).send({ added: false, message: err.stack }));

  await db.query("SELECT * FROM room WHERE id=$1", [id], (err, r) => {
    if (err) {
      res.status(400).send({
        added: false,
        message: "There was an error while creating the freeplay room!",
      });
      return;
    }
    if (r.rowCount >= 1) {
      for (let i = 0; i < songs.length; i++) {
        db.query("INSERT INTO songs(id, songlink, username) VALUES($1,$2,$3)", [
          id,
          songs[i],
          owner,
        ]);
      }
      res.send({ id: id, created: true });
      return;
    }
    res.status(400).send({ added: false, message: "Room does not exist!" });
  });
};
