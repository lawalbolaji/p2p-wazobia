import debug from "debug";
import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";
import { Wallet } from "../../../db_models/wallet";
import { Transfer } from "../../../db_models/transfer";
import { UsersService } from "../../users/services/users.service";
import { CreateTransferDto } from "../dto/create-transfer.dto";
import { WalletService } from "../../wallet/services/wallet.service";

const log: debug.IDebugger = debug("app:transfer-service");

export class TransferService {
  constructor(
    private readonly dbClient: Knex,
    private readonly usersService: UsersService,
    private readonly walletService: WalletService
  ) {}

  async createTransfer(params: {
    amount: number;
    sourceWalletId: number;
    destinationWalletId: number;
    userId: string;
    extTrx?: Knex;
  }) {
    const { amount, sourceWalletId, destinationWalletId, userId, extTrx } = params;
    const trx = extTrx || (await this.dbClient.transaction());
    const transferUuid = uuidv4();

    await trx<Transfer>("transfer").insert({
      uuid: transferUuid,
      source_wallet_id: sourceWalletId,
      destination_wallet_id: destinationWalletId,
      amount: amount,
      user_id: userId,
      status: "pending",
    });

    return transferUuid;
  }

  async updateTransferStatus(transferUuid: string, status: "pending" | "completed" | "returned", extTrx?: Knex) {
    const trx = extTrx || (await this.dbClient.transaction());

    await trx<Transfer>("transfer")
      .update({
        status,
      })
      .where("uuid", transferUuid);
  }

  async executeTransfer(createTransferDto: CreateTransferDto, userId: string) {
    const trx = await this.dbClient.transaction();

    try {
      const deepUserRecord = await this.usersService.fetchUserRecordDeep({ userUuid: userId, trx });
      if (deepUserRecord.wallet.balance < createTransferDto.amount) throw new Error("Insufficient Balance");

      const destinationWallet = await this.walletService.getWalletById(createTransferDto.destination);
      if (!destinationWallet) throw new Error("invalid destination");

      const createTransferOptions = {
        amount: createTransferDto.amount,
        sourceWalletId: deepUserRecord.wallet.id,
        destinationWalletId: destinationWallet.id,
        userId,
        trx,
      };

      const transegrUuid = await this.createTransfer(createTransferOptions);
      await this.walletService.takeMoneyFromWallet(createTransferDto.amount, deepUserRecord.wallet.id, trx);
      await this.walletService.addMoneyToWallet(createTransferDto.amount, destinationWallet.id, trx);
      await this.updateTransferStatus(transegrUuid, "completed", trx);

      trx.commit();
    } catch (error: any) {
      trx.rollback();

      log(error?.message, error?.stack);
      throw error;
    }
  }
}
