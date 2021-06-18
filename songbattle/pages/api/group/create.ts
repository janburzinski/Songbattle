import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";
import { v4 as uuidv4 } from "uuid";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "post") {
    const owner = req.body.owner;
    const id = uuidv4();

    if (typeof owner !== "string") {
      res.status(400).send({
        added: false,
        message: "Bad Input",
      });
      return;
    }

    const db = await connectToDb();
    //await db.query("DROP TABLE groups");
    /*await db.query(
      "CREATE TABLE groups(id varchar(400) UNIQUE, owner varchar(400))"
    );*/

    db.query("INSERT INTO groups(id, owner) VALUES($1,$2)", [id, owner])
      .then(() =>
        res.send({
          created: true,
          id: id,
        })
      )
      .catch((err) =>
        res.status(400).send({ created: false, message: err.stack })
      );
  }
};
