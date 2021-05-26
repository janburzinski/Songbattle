import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "get") {
    const db = await connectToDb();

    db.query("SELECT * FROM stats ORDER BY wins DESC LIMIT 10")
      .then((r) => res.send({ info: r.rows }))
      .catch((err) =>
        res.status(400).send({ added: false, message: err.stack })
      );
  }
};
