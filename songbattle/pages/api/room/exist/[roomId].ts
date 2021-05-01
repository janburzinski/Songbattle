import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../../utils/connectToDb";

export default async (req: VercelRequest, res: VercelResponse) => {
  const id = req.query.roomId;

  if (typeof id !== "string") {
    res.status(400).send({
      added: false,
      message: "Bad Input",
    });
    return;
  }
  const db = await connectToDb();

  db.query("SELECT * FROM room WHERE id=$1", [id], (err, r) => {
    console.log(r.rowCount);
    if (err || r.rowCount <= 0) {
      res.status(200).send({ exist: false });
      return;
    }
    if (r.rowCount >= 1) {
      res.status(200).send({ exist: true });
      return;
    }
  });
};
