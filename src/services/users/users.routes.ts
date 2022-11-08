import { validate, ValidationError } from "class-validator";
import { Response, Router } from "express";
import { Request } from "express-jwt";
import { validateWrapper } from "../auth/dtos/userdetails.dto";
import { WalletTransferDto } from "./dtos/wallet-transfer.dto";
import { executeWalletTransfer, fundWallet, withdrawFromWallet } from "./users.service";

const usersRouter = Router();

usersRouter.post("/:userId/wallet/:walletId/fund", async (req: Request, res: Response) => {
  const passValidation = await validateWrapper(new WalletTransferDto({ ...req.body }), req, res);
  if (!passValidation) return;

  const { userId, walletId } = req.params;
  if (!userId || userId !== req.auth?.uuid || !walletId) return res.status(403).json({ message: "forbidden resource" });

  const details = await fundWallet(req.body, userId!.toString(), walletId!.toString());
  if (!!details.success) return res.status(201).json(details);

  return res.status(400).json(details);
});

usersRouter.post("/:userId/wallet/:walletId/withdraw", async (req: Request, res: Response) => {
  const passValidation = await validateWrapper(new WalletTransferDto({ ...req.body }), req, res);
  if (!passValidation) return;

  const { userId, walletId } = req.params;
  if (!userId || userId !== req.auth?.uuid || !walletId) return res.status(403).json({ message: "forbidden resource" });

  const details = await withdrawFromWallet(req.body, userId!.toString(), walletId!.toString());
  if (!!details.success) return res.status(201).json(details);

  return res.status(400).json(details);
});

usersRouter.post("/:userId/wallet/:walletId/transfer", async (req: Request, res: Response) => {
  const passValidation = await validateWrapper(new WalletTransferDto({ ...req.body }), req, res);
  if (!passValidation) return;

  const { userId, walletId } = req.params;
  if (!userId || userId !== req.auth?.uuid || !walletId || !passValidation) return res.status(403).json({ message: "forbidden resource" });

  const details = await executeWalletTransfer(req.body, userId!.toString(), walletId!.toString());
  if (!!details.success) return res.status(201).json(details);

  return res.status(400).json(details);
});

export { usersRouter };
