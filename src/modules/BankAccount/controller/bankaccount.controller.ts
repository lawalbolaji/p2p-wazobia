import express from "express";
import { BankAccountService } from "../services/bankaccount.service";

export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  async createBankAccount(req: express.Request, res: express.Response) {
    try {
      const result = await this.bankAccountService.createUserBankAccount(req.body, req.body.userId);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ error: "unable to process request" });
    }
  }

  async getBankAccountByUserId(req: express.Request, res: express.Response) {
    res.status(200).json({ token: 0, last4: "1234" });
  }

  // not particularly useful for now since we only support 1 user bank account for payout
  async listBankAccountsByUserId(req: express.Request, res: express.Response) {
    return res.status(200).json([]);
  }
}
