import debug from "debug";
import { Knex } from "knex";
import { UsersService } from "../../users/services/users.service";
import { CreatePayoutDto } from "../dto/create-payout.dto";
import { v4 as uuidv4 } from "uuid";
import { WalletService } from "../../wallet/services/wallet.service";
import { Payout } from "../../../database/models/payout";
import { DemoPaymentProcessor } from "../../payment/services/demo.payment.service";
import { BankAccountService } from "../../bankaccount/services/bankaccount.service";

const log: debug.IDebugger = debug("app:payout-service");

export class PayoutService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dbClient: Knex,
    private readonly walletService: WalletService,
    private readonly bankAccountService: BankAccountService,
    private readonly paymentServiceProvider: DemoPaymentProcessor
  ) {}

  async createPayout(params: { destination: string; amount: number; userEntityId: number; trx: Knex.Transaction }) {
    const { amount, destination, userEntityId, trx } = params;
    const payoutUuid = uuidv4();

    await trx<Payout>("payout").insert({
      uuid: payoutUuid,
      amount: amount,
      status: "pending",
      destination: destination,
      user_entity_id: userEntityId,
    });

    return payoutUuid;
  }

  updatePayoutStatus(payoutUuid: string, status: "pending" | "completed" | "returned", trx: Knex.Transaction) {
    return trx<Payout>("payout")
      .update({
        status,
      })
      .where("uuid", payoutUuid);
  }

  async executePayout(createPayoutDto: CreatePayoutDto, userId: string) {
    const trx = await this.dbClient.transaction();

    try {
      const deepUserRecord = await this.usersService.fetchUserRecordDeep({ userUuid: userId, trx });
      if (deepUserRecord.wallet.balance < createPayoutDto.amount) throw new Error("Insufficient Balance");

      const ownerBankAccount = await this.bankAccountService.getUserBankAccount(userId, trx);
      if (!ownerBankAccount) throw new Error("user has no bank account on record");

      const createPayoutOptions = {
        amount: createPayoutDto.amount,
        destination: ownerBankAccount.ext_token,
        userEntityId: deepUserRecord.user.entity_id,
        trx,
      };
      const payoutUuid = await this.createPayout(createPayoutOptions);
      await this.walletService.takeMoneyFromWallet(createPayoutDto.amount, deepUserRecord.wallet.id, trx);
      const payoutResponse = await this.paymentServiceProvider.payoutToBank(createPayoutDto.amount, "todo: get_user_token");
      await this.updatePayoutStatus(payoutUuid, "completed", trx);
      await trx.commit();

      return {
        _id: payoutUuid,
        status: payoutResponse.status,
        recipient: {
          _id: payoutResponse.token,
          amount: payoutResponse.amount,
        },
      };
    } catch (error: any) {
      await trx.rollback();
      log(error?.message, error?.stack);

      throw error;
    }
  }

  getPayoutDetailsById() {}

  // paginate this
  searchAllPayouts() {}
}
