import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";

export default async (req: VercelRequest, res: VercelResponse) => {
  const id = req.body.id;
  const owner = req.body.owner;

  /**
   * Todo: Define Request Method (if possible) and maybe add some form of authentication
   */

  if (typeof id !== "string" || typeof owner !== "string") {
    res.status(400).send({
      added: false,
      message: "Bad Input",
    });
    return;
  }
  const db = await connectToDb();
  /*await db.query(
    "CREATE TABLE room(id varchar(400) UNIQUE, owner varchar(400))"
  );*/
  await db
    .query("DELETE FROM room WHERE id=$1 AND owner=$2", [id, owner])
    .then((r) => {
      if (r.rowCount <= 0) {
        res.send({ error: true, message: "Room not found" });
        return;
      }
      res.send({ deleted: true, id: id });
    })
    .catch((err) => res.status(400).send({ added: false, message: err.stack }));
};
