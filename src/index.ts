import express, { Request, Response, Express, Router } from "express";
import dotenv from "dotenv";
import { trxRouter } from "./services/transactions/transactions.routes";
import { knex } from "./configs/knex";
import chalk from "chalk";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3100;
const rootUrl = process.env.ROOT_URL || "http://localhost";
const logger = console; // graylog perhaps?

// healthcheck
app.get(`${rootUrl}/healthcheck`, (req: Request, res: Response) => {
  res.send("wallet is up and running");
});

knex
  .raw("SELECT VERSION()")
  .then((version: any) => {
    logger.log(
      chalk.green(
        `[Database]: Connection was succesful. Version: ${version[0][0]["VERSION()"]}`
      )
    );
  })
  .catch((err: any) => {
    console.log(chalk.red(err));
    throw err;
  });

// route configs
app.use(`${rootUrl}/transactions`, trxRouter);

// app is up
app.listen(port, () => {
  logger.log(
    chalk.green(`[Server]⚡️: Server is running at http://localhost:${port}`)
  );
});

// create account
// login and logout

// make deposit -- same here, there's an integration we can send a debit instruction to (bank, credit card etc.)
// withdraw --- how does this work exactly?? I'll assume for all intents and purposes there is an integration that we can send a credit instruction to for this
// transfer funds to another user's account
