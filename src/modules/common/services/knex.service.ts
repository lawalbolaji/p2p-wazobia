import dotenv from "dotenv";
import knex, { Knex } from "knex";
import debug from "debug";

dotenv.config();
const log: debug.IDebugger = debug("app:knex-service");

export class KnexService {
  private connectionOptions = {
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT || 3106),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  };
  private dbClient: Knex;

  constructor() {
    this.createConnectionPool();
  }

  getKnex() {
    return this.dbClient;
  }

  createConnectionPool() {
    log("Attempting Database connection");

    this.dbClient = knex({
      client: "mysql2",
      connection: this.connectionOptions,
      pool: { min: 0, max: 5 },
    });

    this.dbClient
      .raw("SELECT VERSION()")
      .then((version: any) => {
        log(`Connection was succesful. Version: ${version[0][0]["VERSION()"]}`);
      })
      .catch((err: any) => {
        log(`erorr connecting to database, ${err?.message}`);
        throw err;
      });
  }
}
