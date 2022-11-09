import dotenv from "dotenv";
import knex from "knex";

dotenv.config();

const connectionOptions = {
  host: process.env.DATABASE_HOST,
  port: +(process.env.DATABASE_PORT || 3106),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

export const dbClient = knex({
  client: "mysql2",
  connection: connectionOptions,
});
