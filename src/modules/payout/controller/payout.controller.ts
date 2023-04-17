import express from "express";
import { PayoutService } from "../services/payout.service";

export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  async createPayout(req: express.Request, res: express.Response) {
    try {
      const result = await this.payoutService.createNewPayout(req.body, req.body.userId);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ error: "unable to process request" });
    }
  }

  async getPayoutById(req: express.Request, res: express.Response) {
    res.status(200).json({ _id: "", amount: 0, status: "success" });
  }

  async listPayouts(req: express.Request, res: express.Response) {
    return res.status(200).json([]);
  }
}
