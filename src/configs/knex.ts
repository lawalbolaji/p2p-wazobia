import dotenv from "dotenv";
import { Knex } from "knex";

dotenv.config();

const connectionOptions = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

export const knex: Knex = require("knex")({
  client: "mysql2",
  connection: connectionOptions,
});
