import { Client } from "pg";

let cachedClient: Client;

export const connectToDb = async (
  host = process.env.DB_HOST,
  user = process.env.DB_USER,
  database = process.env.DB_DATABASE,
  password = process.env.DB_PASSWORD
) => {
  if (cachedClient) return cachedClient;

  const client = new Client({
    host: host,
    user: user,
    database: database,
    password: password,
  });

  client.connect();
  cachedClient = client;
  return client;
};
