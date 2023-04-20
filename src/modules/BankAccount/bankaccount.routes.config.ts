import express from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import { JwtMiddleware } from "../auth/middleware/jwt.middleware";
import { BankAccountMiddleware } from "./middleware/bankaccount.middleware";
import { BankAccountController } from "./controller/bankaccount.controller";

export class BankAccountRoutes extends CommonRoutesConfig {
  constructor(
    app: express.Application,
    private readonly jwtMiddleware: JwtMiddleware,
    private readonly bankAccountMiddleware: BankAccountMiddleware,
    private readonly bankAccountController: BankAccountController
  ) {
    super(app, "BankAccount Routes");

    this.configureRoutes();
  }

  configureRoutes(): express.Application {
    this.app
      .route("/users/:userId/bankaccounts")
      .all(this.jwtMiddleware.validJWTNeeded)
      .post([
        this.bankAccountMiddleware.validateRequiredFields,
        this.bankAccountController.createBankAccount.bind(this.bankAccountController),
      ])
      .get([this.jwtMiddleware.validJWTNeeded, this.bankAccountController.getBankAccountByUserId.bind(this.bankAccountController)]);

    return this.app;
  }
}
