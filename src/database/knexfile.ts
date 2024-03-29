import { Knex } from "knex";

module.exports = {
  client: "mysql2",
  connection: {
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT || 3306),
    multipleStatements: process.env.NODE_ENV !== "production",
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: "./migrations",
  },
  seeds: {
    directory: "./seeds",
  },
} as Knex.Config;
