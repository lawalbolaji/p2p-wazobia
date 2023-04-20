import dotenv from "dotenv";
import knex, { Knex } from "knex";
import debug from "debug";

dotenv.config();
const log: debug.IDebugger = debug("app:knex-service");

export class KnexService {
  private dbClient: Knex;
  private config: Knex.Config;

  constructor(config: Knex.Config) {
    this.config = config;
    this.createConnectionPool();
  }

  getKnex() {
    return this.dbClient;
  }

  createConnectionPool() {
    log("Attempting Database connection");

    this.dbClient = knex(this.config);
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
