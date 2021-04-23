import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connecToDb";
import { roomExist } from "../../../utils/roomHandler";

export default async (req: VercelRequest, res: VercelResponse) => {
  const id = req.body.id;

  if (typeof id !== "string") {
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
    .query("SELECT * FROM songs WHERE id=$1", [id])
    .then((r) => res.send({ info: r.rows }))
    .catch((err) => res.status(400).send({ added: false, message: err }));
};
