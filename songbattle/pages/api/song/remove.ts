import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";

export default async (req: VercelRequest, res: VercelResponse) => {
  const id = req.body.id;

  /**
   * Todo: Define Request Method (if possible) and maybe add some form of authentication
   */

  if (typeof id !== "string") {
    res.status(400).send({
      error: false,
      message: "Bad Input",
    });
    return;
  }
  const db = await connectToDb();
  /*await db.query(
    "CREATE TABLE songs(id varchar(400) UNIQUE, songlink varchar(400), username varchar(400), votes integer)"
  );*/
  await db
    .query("DELETE FROM songs WHERE id=$1", [id])
    .then((a) => {
      if (a.rowCount <= 0) {
        res.send({ error: true, message: "Room or song not found" });
        return;
      }
      res.send({ deleted: true });
    })
    .catch((err) => res.status(400).send({ added: false, message: err.stack }));
};
