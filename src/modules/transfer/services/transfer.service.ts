import debug from "debug";
import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";
import { Wallet } from "../../../db_models/wallet";
import { Transfer } from "../../../db_models/transfer";
import { UsersService } from "../../users/services/users.service";
import { CreateTransferDto } from "../dto/create-transfer.dto";

const log: debug.IDebugger = debug("app:transfer-service");

export class TransferService {
  constructor(private readonly dbClient: Knex, private readonly usersService: UsersService) {}

  async createTransfer(createTransferDto: CreateTransferDto, userId: string) {
    const trx = await this.dbClient.transaction();
    const transferUuid = uuidv4();

    try {
      const deepUserRecord = await this.usersService.fetchUserRecordDeep({ userUuid: userId, trx });
      if (deepUserRecord.wallet.balance < createTransferDto.amount) throw new Error("Insufficient Balance");

      await trx<Transfer>("transfer").insert({
        uuid: transferUuid,
        source: deepUserRecord.wallet.uuid,
        destination: createTransferDto.destination,
        amount: createTransferDto.amount,
        status: "pending",
      });

      await trx<Wallet>("wallet")
        .update({ balance: trx.raw(`balance - ${createTransferDto.amount}`) })
        .where("id", deepUserRecord.wallet.id);

      await trx<Wallet>("wallet")
        .update({ balance: trx.raw(`balance + ${createTransferDto.amount}`) })
        .where("uuid", createTransferDto.destination);

      await trx<Transfer>("transfer")
        .update({
          status: "completed",
        })
        .where("uuid", transferUuid);

      trx.commit();
    } catch (error: any) {
      trx.rollback();

      log(error?.message, error?.stack);
      throw error;
    }
  }
}
