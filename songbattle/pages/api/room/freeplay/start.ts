import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../../utils/connectToDb";
import { generateId } from "../../../../utils/consts";

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
      "https://open.spotify.com/track/21UkXrc9kD48rNpTMI2ecz?si=d08fb6088c1441b2",
      "https://open.spotify.com/track/5kMCBppYo4eaAXlvOBj6Ti?si=ac5f8746a40f404f",
      "https://open.spotify.com/track/6uvMKqNlrSvcC4NaKnrwjZ?si=ec628b68f4494ce8",
      "https://open.spotify.com/track/0SiddXSHfp3rXlwLWHi5z6?si=d2faa0acf8fc4a91",
    ];
    const randomPickedSongs = songs
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    await db
      .query("INSERT INTO room(id, owner, secretid) VALUES($1,$2,$3)", [
        id,
        owner,
        secretId,
      ])
      .catch((err) =>
        res.status(400).send({ added: false, message: err.stack })
      );

    db.query("SELECT owner FROM room WHERE id=$1", [id], (err, r) => {
      if (err) {
        res.status(400).send({
          added: false,
          message: "There was an error while creating the freeplay room!",
        });
        return;
      }
      if (r.rowCount >= 1) {
        for (let i = 0; i < randomPickedSongs.length; i++) {
          db.query(
            "INSERT INTO songs(id, songlink, username) VALUES($1,$2,$3)",
            [id, randomPickedSongs[i], owner]
          );
        }
        res.send({ id: id, created: true, secretId: secretId });
        return;
      }
      res.status(400).send({ added: false, message: "Room does not exist!" });
    });
  }
};
