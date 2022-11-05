import express, { Request, Response, Express, Router } from "express";
import dotenv from "dotenv";
import { trxRouter } from "./services/transactions/transactions.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const rootUrl = process.env.ROOT_URL;

// healthcheck
app.get(`${rootUrl}/healthcheck`, (req: Request, res: Response) => {
  res.send("wallet is up and running");
});

// route configs
app.use(`${rootUrl}/transactions`, trxRouter);

// database setup
// pool connections etc.

// app is up
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// create account
// login and logout

// make deposit -- same here, there's an integration we can send a debit instruction to (bank, credit card etc.)
// withdraw --- how does this work exactly?? I'll assume for all intents and purposes there is an integration that we can send a credit instruction to for this
// transfer funds to another user's account
