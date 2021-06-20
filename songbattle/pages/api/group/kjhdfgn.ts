import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";
import { __prod__ } from "../../../utils/consts";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "get" && !__prod__) {
    const db = await connectToDb();

    db.query("SELECT * FROM groups").then((r) => res.send({ info: r.rows }));
  }
};
