import { connectToDb } from "./connecToDb";

export const roomExist = async (id: string) => {
  if (typeof id !== "string") return false;
  const db = await connectToDb();
  await db.query("SELECT * FROM rooms WHERE id=$1", [id], (err, res) => {
    if (err) return false;
    if (res.rowCount >= 1) return true;
    return false;
  });
};
