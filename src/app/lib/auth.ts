
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const connectionString = process.env.BETTER_AUTH_DB_URL;

console.log("1.chack" ,connectionString);

if (!connectionString) {
  console.log("2.chack, missing")
  
  throw new Error("BETTER_AUTH_DB_URL is missing in .env");
}

const client = new MongoClient(connectionString);
console.log("3.chack" ,client);


const db = client.db("better-auth-db-2");
console.log("4.chack" ,db);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
});

console.log("5.chack" ,auth);

