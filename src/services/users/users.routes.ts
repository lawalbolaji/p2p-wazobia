import { validate, ValidationError } from "class-validator";
import { Response, Router } from "express";
import { Request } from "express-jwt";
import { validateWrapper } from "../auth/dtos/userdetails.dto";
import { WalletFundDto, WalletTransferDto, WalletWithdrawalDto } from "./dtos/wallet-transfer.dto";
import { executeWalletTransfer, fetchUserDetails, fundWallet, withdrawFromWallet } from "./users.service";
import { dbClient } from "../../configs/knex";

const usersRouter = Router();

usersRouter.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId || userId !== req.auth?.uuid) return res.status(403).json({ message: "forbidden resource" });

  const details = await fetchUserDetails(userId, dbClient);
  if (!!details.success) return res.status(201).json(details);

  return res.status(400).json({ message: "request failed" });
});

usersRouter.post("/:userId/wallet/:walletId/fund", async (req: Request, res: Response) => {
  const passValidation = await validateWrapper(new WalletFundDto({ ...req.body }), req, res);
  if (!passValidation) return;

  const { userId, walletId } = req.params;
  if (!userId || userId !== req.auth?.uuid || !walletId) return res.status(403).json({ message: "forbidden resource" });

  const details = await fundWallet(req.body, userId!.toString(), walletId!.toString(), dbClient);
  if (!!details.success) return res.status(201).json({ message: "wallet successfully funded" });

  return res.status(400).json({ message: "failed transaction" });
});

usersRouter.post("/:userId/wallet/:walletId/withdraw", async (req: Request, res: Response) => {
  const passValidation = await validateWrapper(new WalletWithdrawalDto({ ...req.body }), req, res);
  if (!passValidation) return;

  const { userId, walletId } = req.params;
  if (!userId || userId !== req.auth?.uuid || !walletId) return res.status(403).json({ message: "forbidden resource" });

  const details = await withdrawFromWallet(req.body, userId!.toString(), walletId!.toString(), dbClient);
  if (!!details.success) return res.status(201).json({ message: "withdrawal successful" });

  return res.status(400).json({ message: "failed transaction", reason: details.message });
});

usersRouter.post("/:userId/wallet/:walletId/transfer", async (req: Request, res: Response) => {
  const passValidation = await validateWrapper(new WalletTransferDto({ ...req.body }), req, res);
  if (!passValidation) return;

  const { userId, walletId } = req.params;
  if (!userId || userId !== req.auth?.uuid || !walletId || !passValidation) return res.status(403).json({ message: "forbidden resource" });

  const details = await executeWalletTransfer(req.body, userId!.toString(), walletId!.toString(), dbClient);
  if (!!details.success) return res.status(201).json({ message: "transfer successful" });

  return res.status(400).json({ message: "failed transaction" });
});

export { usersRouter };
