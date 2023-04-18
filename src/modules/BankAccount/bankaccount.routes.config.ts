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
      .route("user/:userId/bankaccounts")
      .all(this.jwtMiddleware.validJWTNeeded)
      .get([this.bankAccountMiddleware.validateRequiredFields, this.bankAccountController.listBankAccountsByUserId])
      .post([this.bankAccountMiddleware.validateRequiredFields, this.bankAccountController.createBankAccount]);

    this.app
      .route("user/:userId/bankaccounts/:bankaccountId")
      .get([
        this.jwtMiddleware.validJWTNeeded,
        this.bankAccountMiddleware.validateRequiredFields,
        this.bankAccountController.getBankAccountByUserId,
      ]);

    return this.app;
  }
}
