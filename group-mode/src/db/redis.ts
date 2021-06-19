import Redis from "ioredis";
require("dotenv").config();

export const connectToRedis = async (
  host = process.env.REDIS_HOST,
  password = process.env.REDIS_PASSWORD,
  port = process.env.REDIS_PORT
) => {
  let redis: Redis.Redis;
  if (password != "") {
    redis = new Redis({
      port: Number(port),
      host: host,
      password: password,
    });
  } else {
    redis = new Redis({
      port: Number(port),
      host: host,
    });
  }
  return redis;
};
