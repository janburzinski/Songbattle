const { connectToRedis } = require("../redis");

describe("Redis Connection Test", () => {
  test("Connect", async () => {
    const redis = await connectToRedis();
    const status = redis.status;
    redis.disconnect();
    expect(status).toBe("connecting");
  });
});
