import express from "express";
import * as http from "http";
import * as winston from "winston";
import * as expressWinston from "express-winston";
import cors from "cors";
import debug from "debug";
import dotenv from "dotenv";
import helmet from "helmet";
import { AuthRoutes } from "./modules/auth/auth.routes.config";
import { CommonRoutesConfig } from "./modules/common/common.routes.config";
import { UserRoutes } from "./modules/users/user.routes.config";
import { AuthController } from "./modules/auth/controllers/auth.controller";
import { AuthMiddleware } from "./modules/auth/middleware/auth.middleware";
import { UsersService } from "./modules/users/services/users.service";
import { KnexService } from "./modules/common/services/knex.service";
import { UsersMiddleware } from "./modules/users/middleware/user.middleware";
import { UsersController } from "./modules/users/controllers/users.controller";
import { JwtMiddleware } from "./modules/auth/middleware/jwt.middleware";

dotenv.config();

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3100;
const rootUrl = process.env.ROOT_URL || "http://localhost";
const routes: Array<CommonRoutesConfig> = [];
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
    winston.format.colorize({ all: true })
  ),
  meta: !!process.env.DEBUG,
};

app.use(expressWinston.logger(loggerOptions));

const dbClient = new KnexService().getKnex();
const usersService = new UsersService(dbClient);
const usersMiddleware = new UsersMiddleware(usersService);
const usersController = new UsersController(usersService);
const authController = new AuthController();
const authMiddleware = new AuthMiddleware(usersService);
const jwtMiddleware = new JwtMiddleware(usersService);

routes.push(new AuthRoutes(app, authMiddleware, authController, jwtMiddleware));
routes.push(new UserRoutes(app, usersMiddleware, usersController, jwtMiddleware));

// TODO: add a proper healthcheck route
const runningMessage = `Server running at http://localhost:${port}`;
app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send(runningMessage);
});

server.listen(port, () => {
  routes.forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });

  console.log(runningMessage);
});
