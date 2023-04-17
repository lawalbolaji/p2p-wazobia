import express from "express";
import { validateWrapper } from "../../../lib/validator";
import { CreatePayoutDto } from "../dto/create-payout.dto";

export class PayoutMiddleware {
  constructor() {}

  async validateRequiredFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    return validateWrapper<CreatePayoutDto>(new CreatePayoutDto({ ...req.body }), res, next);
  }
}
