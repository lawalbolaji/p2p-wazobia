import express from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import { JwtMiddleware } from "../auth/middleware/jwt.middleware";
import { PayoutMiddleware } from "./middleware/payout.middleware";
import { PayoutController } from "./controller/payout.controller";

export class PayoutRoutes extends CommonRoutesConfig {
  constructor(
    app: express.Application,
    private readonly jwtMiddlware: JwtMiddleware,
    private readonly payoutMiddleware: PayoutMiddleware,
    private readonly payoutController: PayoutController
  ) {
    super(app, "Payout Routes");

    this.configureRoutes();
  }

  configureRoutes(): express.Application {
    this.app
      .route("/payouts")
      .all(this.jwtMiddlware.validJWTNeeded)
      .get([this.payoutMiddleware.validateRequiredFields, this.payoutController.listPayouts])
      .post([this.payoutMiddleware.validateRequiredFields, this.payoutController.createPayout.bind(this.payoutController)]);

    this.app
      .route("/payouts/:payoutId")
      .get([
        this.jwtMiddlware.validJWTNeeded,
        this.payoutMiddleware.validateRequiredFields,
        this.payoutController.getPayoutById.bind(this.payoutController),
      ]);

    return this.app;
  }
}
