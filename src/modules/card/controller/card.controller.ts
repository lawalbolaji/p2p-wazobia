import express from "express";
import { CardService } from "../services/card.service";

export class CardController {
  constructor(private readonly cardService: CardService) {}

  async createCard(req: express.Request, res: express.Response) {
    try {
      const result = await this.cardService.createCard(req.body, req.body.userId);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ error: "unable to process request" });
    }
  }

  async listCardsByUserId(req: express.Request, res: express.Response) {
    return res.status(200).json([]);
  }
}
