import knex, { Knex } from "knex";
import debug from "debug";

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

    // this doesn't really serve any purpose since knexjs doesnt provide any error handling for failed database connections
    this.dbClient
      .raw("SELECT VERSION()")
      .then((version: any) => {
        log(`Connection was succesful. Version: ${version[0][0]["VERSION()"]}`);
      })
      .catch((err: any) => {
        log(`erorr connecting to database, ${err}`);
        throw err;
      });
  }
}
