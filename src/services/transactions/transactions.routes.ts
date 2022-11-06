import { Request, Response, Express } from "express";
import { Router } from "express";

const trxRouter = Router();

trxRouter.get("/", (req: Request, res: Response) => {
  res.send("all transactions");
});

// TODO: fund wallet

// TODO: withdraw from wallet

// TODO: transfer funds to another wallet

export { trxRouter };
