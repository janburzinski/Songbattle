import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../../utils/connectToDb";
import { generateId } from "../../../../utils/consts";
import format from "pg-format";
import SpotifyWebApi from "spotify-web-api-node";

const redisKey = `freeplay:songs`;

/**
 * Cache songs?q
 */

//not working
//why does spotify has to invalidate access tokens after 1 hour :(
const getSongs = async (roomId: string, owner: string): Promise<any> => {
  return new Promise(async (resolve, _reject) => {
    let songs: any = [];
    //rapcaviar
    const playlistId = "37i9dQZF1DX0XUsuxWHRQd";
    const spotifyApi: SpotifyWebApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    spotifyApi.setAccessToken(
      "BQBIzHlol1e1nJ24hPeu9Yv6IGlJAv2rd17yD5A7fiQM3xmuIE_b6PZ7EiMRdevgKCfDXzY3WCcuJ0HmugL0gOcAg8q7fUCpHcdfb62lZ8bubNZKnWW3NIakN7kqsuzzBqjorEqS3h9Iy9KBTQDfNNgxEHdlgl6WDXfSvNsu"
    );
    spotifyApi.getPlaylist(playlistId, { market: "de" }).then((data) => {
      console.log(data.body);
    });
    //console.log(playlistSongs.body);
    //console.log(playlistSongs);
    /*for (let i = 0; i < 50; i++) {
      try {
        //@ts-ignore
        const obj = [
          roomId,
          playlistSongs.items[i].track.external_urls.spotify,
          owner,
        ];
        //@ts-ignore
        songs.push(obj);
      } catch (err) {
        console.log(err);
      }
    }*/
    resolve(songs);
    return;
  });
};

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
      [
        id,
        "https://open.spotify.com/track/2IePEfMAtqWS6rLXXFZIgI?si=c549e9fe7bab48ea",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/1HyZhieUhfrHnI2xhC8Ujz?si=c70d638836324d37",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/14mc78ctIxHOMYz5fWja7Q?si=ef49b9a1965046af",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/0xAY7oG6h1YBv0Tvc8eUnu?si=755cb05cf9724425",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/4zb2Qicw1hoIaQ6Lg7BqjK?si=c9571aee71984461",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/0cf6Z2QLqShle0CQQeK9Do?si=f3ad0b72164b40c8",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/1D3z6HTiQsNmZxjl7F7eoG?si=b4c56ebd535a4e3c",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/40mjsnRjCpycdUw3xhS20g?si=1c036513fba5482d",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/4G8SyOXJeXXzi3u9xT9GUx?si=a73546b7f4ab4547",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/43PGPuHIlVOc04jrZVh9L6?si=74892a7d6cc8466d",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/21UkXrc9kD48rNpTMI2ecz?si=d08fb6088c1441b2",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/5kMCBppYo4eaAXlvOBj6Ti?si=ac5f8746a40f404f",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/6uvMKqNlrSvcC4NaKnrwjZ?si=ec628b68f4494ce8",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/0SiddXSHfp3rXlwLWHi5z6?si=d2faa0acf8fc4a91",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/0KBa4BiUHxQNrqsaDZzUG7?si=0c884ca86a3e4693",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/7HsjuVBM93Z2RoxjpWLgTT?si=c0d7768efd7048eb",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/6vB8bdQCCTDDIH8fhRfuXA?si=be03dea236404566",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/07zZzNfCUizQ2puAmTLhrc?si=9732019613b74d58",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/7l0Ne1V1FMkI3kvQPbkRLX?si=a46de3a29a674a80",
        owner,
      ],
      [
        id,
        "https://open.spotify.com/track/5gkw016NMmu8bFsuPcjLRd?si=430b177af0dc406d",
        owner,
      ],
    ];

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
