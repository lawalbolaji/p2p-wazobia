import express from "express";
import { CreateChargeDto } from "../dto/create-charge.dto";
import { validateWrapper } from "../../../lib/validator";

export class ChargeMiddleware {
  constructor() {}

  async validateRequiredFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    return validateWrapper<CreateChargeDto>(new CreateChargeDto({ ...req.body }), res, next);
  }
}
