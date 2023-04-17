import express from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import { AuthController } from "./controllers/auth.controller";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { JwtMiddleware } from "./middleware/jwt.middleware";

export class AuthRoutes extends CommonRoutesConfig {
  constructor(
    app: express.Application,
    private readonly authMiddleware: AuthMiddleware,
    private readonly authController: AuthController,
    private readonly jwtMiddleware: JwtMiddleware
  ) {
    super(app, "Auth Routes");

    this.configureRoutes();
  }

  configureRoutes(): express.Application {
    this.app
      .route("/auth")
      .post([
        this.authMiddleware.validateAuthRequestBodyFields,
        this.authMiddleware.verifyUserPassword,
        this.authController.createJWT,
      ]);

    this.app.post(`/auth/refresh-token`, [
      this.jwtMiddleware.validJWTNeeded,
      this.jwtMiddleware.verifyRefreshBodyField,
      this.jwtMiddleware.validRefreshNeeded,
      this.authController.createJWT,
    ]);

    return this.app;
  }
}
