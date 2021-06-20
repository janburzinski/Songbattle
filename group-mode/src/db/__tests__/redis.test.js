const { connectToRedis } = require("../redis");

describe("Redis Connection Test", () => {
  test("Connect", async () => {
    const redis = await connectToRedis();
    let error = null;
    redis.on("error", (err) => (error = err));
    const status = redis.status;
    redis.disconnect();
    expect(error).toBeNull();
    expect(status).toBe("connecting");
  });
});
