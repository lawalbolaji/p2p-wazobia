import express, { Request, Response, Express, Router } from "express";
import dotenv from "dotenv";
import { knex } from "./configs/knex";
import chalk from "chalk";
import { expressjwt } from "express-jwt";
import { authRouter } from "./services/auth/auth.routes";
import { logger } from "./configs/logger";
import { usersRouter } from "./services/users/users.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3100;
const rootUrl = process.env.ROOT_URL || "http://localhost";

app.use(express.json());

// healthcheck
app.get(`${rootUrl}/healthcheck`, (req: Request, res: Response) => {
  res.send("wallet is up and running");
});

// check database connection
knex
  .raw("SELECT VERSION()")
  .then((version: any) => {
    logger.log(chalk.green(`[Database]: Connection was succesful. Version: ${version[0][0]["VERSION()"]}`));
  })
  .catch((err: any) => {
    logger.log(chalk.red(err));
    throw err;
  });

// route configs
app.use(`${rootUrl}/auth`, authRouter);
app.use(`${rootUrl}/users`, [expressjwt({ secret: process.env.JWT_SECRET!, algorithms: ["RS512"] })], usersRouter);

// app is up
app.listen(port, () => {
  logger.log(chalk.green(`[Server]⚡️: Server is running at http://localhost:${port}`));
});
