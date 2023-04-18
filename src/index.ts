import express from "express";
import * as http from "http";
import * as winston from "winston";
import * as expressWinston from "express-winston";
import cors from "cors";
import debug from "debug";
import dotenv from "dotenv";
import helmet from "helmet";
import { CommonRoutesConfig } from "./modules/common/common.routes.config";
import { loadRoutes } from "./configs/loadroutes";

dotenv.config();

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
  meta: !!process.env.DEBUG,
};

app.use(expressWinston.logger(loggerOptions));

// TODO: add a proper healthcheck route
const runningMessage = `Server running at http://localhost:${port}`;
app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send(runningMessage);
});

app.use("/api/v1", v1App);

server.listen(port, () => {
  loadRoutes(v1App).forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });

  console.log(runningMessage);
});
