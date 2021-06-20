import { VercelRequest, VercelResponse } from "@vercel/node";
import { connectToRedis } from "../../../../utils/connectToRedis";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method.toLowerCase() === "get") {
    const { roomId } = req.query;

    if (typeof roomId !== "string") {
      res.status(400).send({
        exist: false,
        message: "dayyum",
      });
      return;
    }
    const redis = await connectToRedis();
    const cookie = req.cookies.secret_key;
    if (cookie === null || cookie === "")
      return res.status(200).send({ exist: false });
    console.log("cookie: " + cookie);

    redis.get(`owner:${roomId}`, (err, r) => {
      if (err) {
        redis.disconnect();
        return res.status(200).send({ exist: false });
      }
      if (r === cookie) {
        redis.disconnect();
        return res.status(200).send({ exist: true });
      }
      redis.disconnect();
      return res.status(200).send({ exist: false });
    });
  }
};
