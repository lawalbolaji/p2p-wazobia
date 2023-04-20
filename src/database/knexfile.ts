import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();
export const knexConfig: Knex.Config = {
  client: "mysql2",
  connection: {
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT || 3306),
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
  },
};
