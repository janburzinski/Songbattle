import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../../utils/connectToDb";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "get") {
    const { slug } = req.query;
    const id = slug[0];

    if (typeof id !== "string") {
      res.status(400).send({
        exist: false,
        message: "Bad Input",
      });
      return;
    }
    const db = await connectToDb();

    //check with the cookie if the person trying to access is is the person who created the room
    if (slug.length > 0 && slug[1] === "secure") {
      // check if the user has the right cookie
      const userCookie = req.cookies.user;
      if (userCookie === null || userCookie === "undefined")
        return res.status(200).send({ exist: false });
      db.query("SELECT secretid FROM room WHERE id=$1", [id], (err, r) => {
        if (err || r.rowCount <= 0) {
          return res.status(200).send({ exist: false });
        }
        if (r.rows[0].secretid === userCookie && r.rowCount >= 0) {
          return res.status(200).send({ exist: true });
        } else {
          return res.status(200).send({ exist: false });
        }
      });
      //check if the room exists normally
    } else {
      // check if the user has the right cookie
      db.query("SELECT owner FROM room WHERE id=$1", [id], (err, r) => {
        if (err || r.rowCount <= 0) {
          return res.status(200).send({ exist: false });
        }
        if (r.rowCount >= 1) {
          return res.status(200).send({ exist: true });
        }
        return res.status(200).send({ exist: false });
      });
    }
  }
};
