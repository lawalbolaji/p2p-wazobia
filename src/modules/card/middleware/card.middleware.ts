import express from "express";
import { validateWrapper } from "../../../lib/validator";
import { CreateCardDto } from "../dto/createcard.dto";

export class CardMiddleware {
  constructor() {}

  async validateRequiredFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    return validateWrapper<CreateCardDto>(new CreateCardDto({ ...req.body }), res, next);
  }
}
