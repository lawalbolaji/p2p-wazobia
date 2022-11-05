import { Request, Response, Express } from "express";
import { Router } from "express";

const trxRouter = Router();

trxRouter.get("/", (req: Request, res: Response) => {
  res.send("all transactions");
});

export { trxRouter };
