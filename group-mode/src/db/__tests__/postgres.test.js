const { connectToDb } = require("../connectToDb");

describe("PostgreSQL Connection Test", () => {
  test("Connect", async () => {
    const db = await connectToDb(true);
    let error = null;
    db.connect((err) => (err = error));
    db.end();
    expect(error).toBeNull();
  });
});
