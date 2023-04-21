import express from "express";
import debug from "debug";
import { User } from "../../../database/models/user";
import * as bcrypt from "bcrypt";
import { AuthRequestDto } from "../dtos/authrequest.dto";
import { validateWrapper } from "../../../lib/validator";
import { UsersService } from "../../users/services/users.service";

const log: debug.IDebugger = debug("app:users-middleware");

export class AuthMiddleware {
  constructor(private readonly usersService: UsersService) {}

  verifyUserPassword = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const user: User = await this.usersService.getUserByEmailWithPassword(req.body.email);

      if (!!user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
          req.body = {
            userId: user.uuid,
          };

          return next();
        }
      }

      res.status(400).send({ errors: ["Invalid email and/or password"] });
    } catch (error) {
      log("error: %0", error);
      res.status(500).send({ error: ["unable to process request"] });
    }
  };

  validateAuthRequestBodyFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    return validateWrapper(new AuthRequestDto({ ...req.body }), res, next);
  }
}
