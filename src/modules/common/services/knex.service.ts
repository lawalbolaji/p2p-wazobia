import dotenv from "dotenv";
import knex, { Knex } from "knex";
import debug from "debug";

dotenv.config();
const log: debug.IDebugger = debug("app:knex-service");

export class KnexService {
  private count = 0; // for retries
  private connectionOptions = {
    host: process.env.DATABASE_HOST,
    port: +(process.env.DATABASE_PORT || 3106),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  };
  private dbClient: Knex;

  constructor() {
    this.connectWithRetry();
  }

  getKnex() {
    return this.dbClient;
  }

  connectWithRetry() {
    // TODO: create pool of database connections
    log("Attempting Database connection (will retry if needed)");

    this.dbClient = knex({
      client: "mysql2",
      connection: this.connectionOptions,
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
