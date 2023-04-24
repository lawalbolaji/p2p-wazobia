import express from "express";
import * as http from "http";
import * as winston from "winston";
import * as expressWinston from "express-winston";
import cors from "cors";
import debug from "debug";
import helmet from "helmet";
import { CommonRoutesConfig } from "./modules/common/common.routes.config";
import { loadRoutes } from "./factory/routes.factory";
import { KnexService } from "./modules/common/services/knex.service";
import * as knexConfig from "../src/database/knexfile";

const app: express.Application = express();
const v1App: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3100;
const debugLog: debug.IDebugger = debug("app");

app.use(helmet());

// parse all incoming requests as json
app.use(express.json());

// allow cross-origin requests
app.use(cors());

const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({
      all: true,
    })
  ),
};

if (!process.env.DEBUG) {
  loggerOptions.meta = false;
  if (typeof global.it === "function") {
    loggerOptions.level = "http";
  }
}

app.use(expressWinston.logger(loggerOptions));

// TODO: add a proper healthcheck route
const runningMessage = `Server running at http://localhost:${port}`;
app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send(runningMessage);
});

// setup database conn
const dbClient = new KnexService(knexConfig).getKnex();

app.use("/api/v1", v1App);

export default server.listen(port, () => {
  loadRoutes(v1App, dbClient).forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });

  console.log(runningMessage);
});
