import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToDb } from "../../../utils/connectToDb";
import { generateId } from "../../../utils/consts";

export default async (req: VercelRequest, res: VercelResponse) => {
  const owner = req.body.owner;
  const id = generateId();

  if (typeof owner !== "string") {
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
    .query("INSERT INTO room(id, owner) VALUES($1,$2)", [id, owner])
    .then(() => res.send({ created: true, id: id }))
    .catch((err) => res.status(400).send({ added: false, message: err.stack }));
};
