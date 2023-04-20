import express from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import { JwtMiddleware } from "../auth/middleware/jwt.middleware";
import { ChargeMiddleware } from "./middleware/charge.middlware";
import { ChargeController } from "./controller/charge.controller";

export class ChargeRoutes extends CommonRoutesConfig {
  constructor(
    app: express.Application,
    private readonly jwtMiddlware: JwtMiddleware,
    private readonly chargeMiddleware: ChargeMiddleware,
    private readonly chargeController: ChargeController
  ) {
    super(app, "Charge Routes");

    this.configureRoutes();
  }

  configureRoutes(): express.Application {
    this.app
      .route("/charges")
      .all(this.jwtMiddlware.validJWTNeeded)
      .get([this.chargeMiddleware.validateRequiredFields, this.chargeController.listCharges])
      .post([this.chargeMiddleware.validateRequiredFields, this.chargeController.createCharge.bind(this.chargeController)]);

    this.app
      .route("/charges/:chargeId")
      .get([
        this.jwtMiddlware.validJWTNeeded,
        this.chargeMiddleware.validateRequiredFields,
        this.chargeController.getChargeById.bind(this.chargeController),
      ]);

    return this.app;
  }
}
