import express from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import { UsersMiddleware } from "./middleware/user.middleware";
import { UsersController } from "./controllers/users.controller";
import { JwtMiddleware } from "../auth/middleware/jwt.middleware";

export class UserRoutes extends CommonRoutesConfig {
  constructor(
    app: express.Application,
    private readonly usersMiddleware: UsersMiddleware,
    private readonly usersController: UsersController,
    private readonly jwtMiddleware: JwtMiddleware
  ) {
    super(app, "User Routes");
  }

  configureRoutes(): express.Application {
    this.app
      .route(`/users`)
      .post(
        this.usersMiddleware.validateRequiredUserBodyFields,
        this.usersMiddleware.validateSameEmailDoesntExist.bind(this.usersMiddleware),
        this.usersController.createUser.bind(this.usersController)
      );

    this.app.param(`userId`, this.usersMiddleware.extractUserId);
    this.app
      .route(`/users/:userId`)
      .all(this.jwtMiddleware.validJWTNeeded)
      .get(this.usersController.getUserById)
      .patch(this.usersController.updateUser);

    return this.app;
  }
}
