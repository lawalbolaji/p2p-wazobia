import express from "express";
import { validateWrapper } from "../../../lib/validator";
import { CreateTransferDto } from "../dto/create-transfer.dto";

export class TransferMiddleware {
  constructor() {}

  async validateRequiredFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    return validateWrapper<CreateTransferDto>(new CreateTransferDto({ ...req.body }), res, next);
  }
}
