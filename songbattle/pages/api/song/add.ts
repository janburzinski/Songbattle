import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";

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
    return;
  }
  const db = await connectToDb();
  /*await db.query(
    "CREATE TABLE songs(id varchar(400), songlink varchar(400), username varchar(400))"
  );*/

  db.query("SELECT * FROM room WHERE id=$1", [id], (err, r) => {
    if (err) {
      res.status(400).send({ added: false, message: "Room does not exist!" });
      return;
    }
    if (r.rowCount >= 1) {
      db.query("INSERT INTO songs(id, songlink, username) VALUES($1,$2,$3)", [
        id,
        songLink,
        username,
      ])
        .then(() => res.send({ added: true }))
        .catch((err) =>
          res.status(400).send({ added: false, message: err.stack })
        );
      return;
    }
    res.status(400).send({ added: false, message: "Room does not exist!" });
  });
};
