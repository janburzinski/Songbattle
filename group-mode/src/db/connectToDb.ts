import { Client } from "pg";

let cachedClient: Client;

export const connectToDb = async (
  test = false,
  host = process.env.DB_HOST,
  user = process.env.DB_USER,
  database = process.env.DB_DATABASE,
  password = process.env.DB_PASSWORD
) => {
  if (cachedClient && !test) return cachedClient;

  const client = new Client({
    host: host,
    user: user,
    database: database,
    password: password,
    connectionTimeoutMillis: 0,
  });

  if (!test) client.connect();
  client.on("error", (err) => console.error(err));
  cachedClient = client;
  return client;
};
