import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connecToDb";

export default async (req: VercelRequest, res: VercelResponse) => {
  const songLink = req.body.songlink;
  const username = req.body.username;
  const id = req.body.id;

  if (
    typeof songLink !== "string" ||
    typeof username !== "string" ||
    typeof id !== "string"
  ) {
    res.status(400).send({
      added: false,
      message: "Bad Input",
    });
  }
  const db = await connectToDb();
  /*await db.query(
    "CREATE TABLE songs(id varchar(400) UNIQUE, songlink varchar(400), username varchar(400))"
  );*/
  await db
    .query("INSERT INTO songs(id, songlink, username) VALUES($1,$2,$3)", [
      id,
      songLink,
      username,
    ])
    .then(() => res.send({ created: true }))
    .catch((err) => res.status(400).send({ added: false, message: err }));
};
