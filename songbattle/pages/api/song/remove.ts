import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "delete") {
    const songlink = req.body.songlink;
    const id = req.body.id;

    if (typeof id !== "string" || typeof songlink !== "string") {
      res.status(400).send({
        error: false,
        message: "Bad Input",
      });
      return;
    }
    const db = await connectToDb();

    await db
      .query("SELECT * FROM songs WHERE id=$1", [id])
      .then((asd) => {
        db.query("DELETE FROM songs WHERE songlink=$1 AND id=$2", [
          songlink,
          id,
        ])
          .then((a) => {
            if (a.rowCount <= 0) {
              res.send({ error: true, message: "Room or song not found" });
              return;
            }
            res.send({ deleted: true, songCount: asd.rowCount - 1 });
          })
          .catch((err) =>
            res.status(400).send({ added: false, message: err.stack })
          );
      })
      .catch((err) =>
        res.status(400).send({ added: false, message: err.stack })
      );
  }
};
