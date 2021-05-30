import Redis from "ioredis";

export const connectToRedis = async (
  host = process.env.REDIS_HOST,
  password = process.env.REDIS_PASSWORD,
  port = process.env.REDIS_PORT
) => {
  const redis = new Redis({
    port: Number(port),
    host: host,
    password: password,
  });
  return redis;
};
