// import { Response, Router } from "express";
// import { Request } from "express-jwt";
// import { WalletFundDto, WalletTransferDto, WalletWithdrawalDto } from "../users/dto/wallet-transfer.dto";
// import { executeWalletTransfer, fundWallet, withdrawFromWallet } from "./services/users.service";
// import { validateWrapper } from "../../lib/validator";
// import dbClient from "../common/services/knex.service";

import express from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import { JwtMiddleware } from "../auth/middleware/jwt.middleware";

// const usersRouter = Router();

// usersRouter.post("/:userId/wallet/:walletId/fund", async (req: Request, res: Response) => {
//   const passValidation = await validateWrapper(new WalletFundDto({ ...req.body }), req, res);
//   if (!passValidation) return;

//   const { userId, walletId } = req.params;
//   if (!userId || userId !== req.auth?.uuid || !walletId) return res.status(403).json({ message: "forbidden resource" });

//   const details = await fundWallet(req.body, userId!.toString(), walletId!.toString(), dbClient);
//   if (!!details.success) return res.status(201).json({ message: "wallet successfully funded" });

//   return res.status(400).json({ message: "failed transaction" });
// });

// usersRouter.post("/:userId/wallet/:walletId/withdraw", async (req: Request, res: Response) => {
//   const passValidation = await validateWrapper(new WalletWithdrawalDto({ ...req.body }), req, res);
//   if (!passValidation) return;

//   const { userId, walletId } = req.params;
//   if (!userId || userId !== req.auth?.uuid || !walletId) return res.status(403).json({ message: "forbidden resource" });

//   const details = await withdrawFromWallet(req.body, userId!.toString(), walletId!.toString(), dbClient);
//   if (!!details.success) return res.status(201).json({ message: "withdrawal successful" });

//   return res.status(400).json({ message: "failed transaction", reason: details.message });
// });

// usersRouter.post("/:userId/wallet/:walletId/transfer", async (req: Request, res: Response) => {
//   const passValidation = await validateWrapper(new WalletTransferDto({ ...req.body }), req, res);
//   if (!passValidation) return;

//   const { userId, walletId } = req.params;
//   if (!userId || userId !== req.auth?.uuid || !walletId || !passValidation)
//     return res.status(403).json({ message: "forbidden resource" });

//   const details = await executeWalletTransfer(req.body, userId!.toString(), walletId!.toString(), dbClient);
//   if (!!details.success) return res.status(201).json({ message: "transfer successful" });

//   return res.status(400).json({ message: "failed transaction" });
// });

// export { usersRouter };

enum supportedTransactions {
  c2wcreditrequest = "c2wcreditrequest",
  b2wcreditrequest = "b2wcreditrequest",
  w2bdebitrequest = "w2bdebitrequest",
  w2wtrasnfer = "w2wtrasnfer",
}

export class TransactionRoutes extends CommonRoutesConfig {
  constructor(app: express.Application, private readonly jwtMiddleware: JwtMiddleware) {
    super(app, "Transaction Routes");
  }

  configureRoutes(): express.Application {
    this.app
      .route("/transactions")
      .all(this.jwtMiddleware.validJWTNeeded)
      .get((req: express.Request, res: express.Response, next: express.NextFunction) => {})
      .post((req: express.Request, res: express.Response, next: express.NextFunction) => {});

    this.app
      .route("transactions/:transactionId")
      .get(
        this.jwtMiddleware.validJWTNeeded,
        (req: express.Request, res: express.Response, next: express.NextFunction) => {}
      );

    return this.app;
  }
}
