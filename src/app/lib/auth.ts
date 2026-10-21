
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const connectionString = process.env.BETTER_AUTH_DB_URL;

if (!connectionString) {
  throw new Error("BETTER_AUTH_DB_URL is missing in .env");
}

const client = new MongoClient(connectionString);
const db = client.db("better-auth-db-2");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
