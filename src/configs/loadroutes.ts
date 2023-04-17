import { AuthRoutes } from "../modules/auth/auth.routes.config";
import { AuthController } from "../modules/auth/controllers/auth.controller";
import { AuthMiddleware } from "../modules/auth/middleware/auth.middleware";
import { JwtMiddleware } from "../modules/auth/middleware/jwt.middleware";
import { AuthService } from "../modules/auth/services/auth.service";
import { ChargeRoutes } from "../modules/charge/charge.routes.config";
import { ChargeController } from "../modules/charge/controller/charge.controller";
import { ChargeMiddleware } from "../modules/charge/middleware/charge.middlware";
import { ChargeService } from "../modules/charge/services/charge.service";
import { CommonRoutesConfig } from "../modules/common/common.routes.config";
import { KnexService } from "../modules/common/services/knex.service";
import { PayoutController } from "../modules/payout/controller/payout.controller";
import { PayoutMiddleware } from "../modules/payout/middleware/payout.middleware";
import { PayoutRoutes } from "../modules/payout/payout.routes.config";
import { PayoutService } from "../modules/payout/services/payout.service";
import { TransferController } from "../modules/transfer/controller/transfer.controller";
import { TransferMiddleware } from "../modules/transfer/middleware/transfer.middleware";
import { TransferService } from "../modules/transfer/services/transfer.service";
import { TransferRoutes } from "../modules/transfer/transfer.routes.config";
import { UsersController } from "../modules/users/controllers/users.controller";
import { UsersMiddleware } from "../modules/users/middleware/user.middleware";
import { UsersService } from "../modules/users/services/users.service";
import { UserRoutes } from "../modules/users/user.routes.config";
import { WalletService } from "../modules/wallet/services/wallet.service";
import express from "express";

export const loadRoutes = (app: express.Application) => {
  const routes: Array<CommonRoutesConfig> = [];

  const dbClient = new KnexService().getKnex();
  const walletService = new WalletService(dbClient);
  const authService = new AuthService();
  const usersService = new UsersService(dbClient, walletService, authService);
  const usersMiddleware = new UsersMiddleware(usersService);
  const usersController = new UsersController(usersService);
  const authController = new AuthController();
  const authMiddleware = new AuthMiddleware(usersService);
  const jwtMiddleware = new JwtMiddleware(usersService);
  const chargeMiddleware = new ChargeMiddleware();
  const chargeService = new ChargeService(dbClient, usersService, walletService);
  const chargeController = new ChargeController(chargeService);
  const payoutMiddleware = new PayoutMiddleware();
  const payoutService = new PayoutService(usersService, dbClient, walletService);
  const payoutController = new PayoutController(payoutService);
  const transferMiddleware = new TransferMiddleware();
  const transferService = new TransferService(dbClient, usersService);
  const transferController = new TransferController(transferService);

  routes.push(new AuthRoutes(app, authMiddleware, authController, jwtMiddleware));
  routes.push(new UserRoutes(app, usersMiddleware, usersController, jwtMiddleware));
  routes.push(new ChargeRoutes(app, jwtMiddleware, chargeMiddleware, chargeController));
  routes.push(new PayoutRoutes(app, jwtMiddleware, payoutMiddleware, payoutController));
  routes.push(new TransferRoutes(app, jwtMiddleware, transferMiddleware, transferController));

  return routes;
};
