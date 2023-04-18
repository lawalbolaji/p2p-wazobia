import express from "express";
import { TransferService } from "../services/transfer.service";

export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  async createTrasnfer(req: express.Request, res: express.Response) {
    try {
      const result = await this.transferService.executeTransfer(req.body, req.body.userId);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ error: "unable to process request" });
    }
  }

  async getTransferById(req: express.Request, res: express.Response) {
    res.status(200).json({ _id: "", amount: 0, status: "success" });
  }

  async listTransfers(req: express.Request, res: express.Response) {
    return res.status(200).json([]);
  }
}
