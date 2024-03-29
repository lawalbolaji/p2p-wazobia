import express from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import { JwtMiddleware } from "../auth/middleware/jwt.middleware";
import { CardMiddleware } from "./middleware/card.middleware";
import { CardController } from "./controller/card.controller";

export class CardRoutes extends CommonRoutesConfig {
  constructor(
    app: express.Application,
    private readonly jwtMiddleware: JwtMiddleware,
    private readonly cardMiddleware: CardMiddleware,
    private readonly cardController: CardController
  ) {
    super(app, "Card Routes");

    this.configureRoutes();
  }

  configureRoutes(): express.Application {
    this.app
      .route("/users/:userId/cards")
      .all(this.jwtMiddleware.validJWTNeeded)
      .get([this.cardMiddleware.validateRequiredFields, this.cardController.listCardsByUserId.bind(this.cardController)])
      .post([this.cardMiddleware.validateRequiredFields, this.cardController.createCard.bind(this.cardController)]);

    return this.app;
  }
}
