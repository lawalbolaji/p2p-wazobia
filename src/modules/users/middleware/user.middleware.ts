import express from "express";
import debug from "debug";
import { validateWrapper } from "../../../lib/validator";
import { CreateUserDto } from "../dto/create.user.dto";
import { UsersService } from "../services/users.service";

const log: debug.IDebugger = debug("app:users-middleware");
export class UsersMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async extractUserId(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.body.id = req.params.userId;
    next();
  }

  async validateRequiredUserBodyFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    return validateWrapper<CreateUserDto>(new CreateUserDto({ ...req.body }), res, next);
  }

  async validateSameEmailDoesntExist(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = await this.usersService.getUserByEmail(req.body.email);

    if (user) {
      res.status(400).send({ error: `User email already exists` });
    } else {
      next();
    }
  }
}
