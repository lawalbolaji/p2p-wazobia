import express from "express";
import { ChargeService } from "../services/charge.service";

export class ChargeController {
  constructor(private readonly chargeService: ChargeService) {}

  async createCharge(req: express.Request, res: express.Response) {
    try {
      const result = await this.chargeService.executeCharge(req.body, req.body.userId);

      return res.status(201).json(result);
    } catch (error) {
      // TODO: check error type here and craft specific message to user

      return res.status(400).json({ error: "unable to process request " });
    }
  }

  getChargeById(req: express.Request, res: express.Response) {
    return res.status(200).json({ _id: "", amount: 0, status: "success" });
  }

  listCharges(req: express.Request, res: express.Response) {
    return res.status(200).json({ data: [] });
  }
}
