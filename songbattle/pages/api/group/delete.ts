import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "delete") {
    const id = req.body.id;

    if (typeof id !== "string") {
      res.status(400).send({
        added: false,
        message: "Bad Input",
      });
      return;
    }
    const db = await connectToDb();

    db.query("SELECT songlink FROM group_songs WHERE id=$1", [id])
      .then((a) => {
        if (a.rowCount >= 1) {
          db.query("DELETE FROM groups WHERE id=$1", [id])
            .then((r) => {
              if (r.rowCount <= 0) {
                res
                  .status(200)
                  .send({ deleted: false, message: "Room not found!" });
                res.end();
                return;
              }
              res.status(200).send({ deleted: true, id: id });
              res.end();
            })
            .catch((err) =>
              res
                .status(400)
                .send({ deleted: false, error: true, message: err.stack })
            );
          return;
        }
        res.status(400).send({
          error: true,
          message: "There are too many songs still in the queue!",
        });
        res.end();
        return;
      })
      .catch((err) =>
        res
          .status(400)
          .send({ deleted: false, error: true, message: err.stack })
      );
  }
};
