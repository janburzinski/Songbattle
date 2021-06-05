import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";
import { generateId, url } from "../../../utils/consts";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "post") {
    const owner = req.body.owner;
    const id = generateId();
    const secretId = generateId();

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
      "CREATE TABLE groups(id varchar(400) UNIQUE, owner varchar(400), secretid varchar(400))"
    );*/

    db.query("INSERT INTO groups(id, owner, secretid) VALUES($1,$2,$3)", [
      id,
      owner,
      secretId,
    ])
      .then(() =>
        res.send({
          created: true,
          id: id,
          secretId: secretId,
        })
      )
      .catch((err) =>
        res.status(400).send({ added: false, message: err.stack })
      );
  }
};
