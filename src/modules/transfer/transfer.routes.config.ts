import express from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import { JwtMiddleware } from "../auth/middleware/jwt.middleware";
import { TransferController } from "./controller/transfer.controller";
import { TransferMiddleware } from "./middleware/transfer.middleware";

export class TransferRoutes extends CommonRoutesConfig {
  constructor(
    app: express.Application,
    private readonly jwtMiddleware: JwtMiddleware,
    private readonly transferMiddleware: TransferMiddleware,
    private readonly transferController: TransferController
  ) {
    super(app, "Transfer Routes");

    this.configureRoutes();
  }

  configureRoutes(): express.Application {
    this.app
      .route("/transfers")
      .all(this.jwtMiddleware.validJWTNeeded)
      .get([this.transferMiddleware.validateRequiredFields, this.transferController.listTransfers])
      .post([this.transferMiddleware.validateRequiredFields, this.transferController.createTrasnfer.bind(this.transferController)]);

    this.app
      .route("/transfers/:transferId")
      .get([
        this.jwtMiddleware.validJWTNeeded,
        this.transferMiddleware.validateRequiredFields,
        this.transferController.getTransferById.bind(this.transferController),
      ]);

    return this.app;
  }
}
