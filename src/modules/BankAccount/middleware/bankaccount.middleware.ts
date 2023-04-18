import express from "express";
import { validateWrapper } from "../../../lib/validator";
import { CreateBankAccountDto } from "../dto/createbankaccount.dto";

export class BankAccountMiddleware {
  constructor() {}

  async validateRequiredFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    return validateWrapper<CreateBankAccountDto>(new CreateBankAccountDto({ ...req.body }), res, next);
  }
}
