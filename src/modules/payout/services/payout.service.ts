import debug from "debug";
import { Knex } from "knex";
import { BankAccount } from "../../../db_models/bankaccount";
import { UsersService } from "../../users/services/users.service";
import { CreatePayoutDto } from "../dto/create-payout.dto";
import { v4 as uuidv4 } from "uuid";
import { WalletService } from "../../wallet/services/wallet.service";
import { Payout } from "../../../db_models/payout";
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

  async createPayout(params: { destination: string; amount: number; userId: string; extTrx?: Knex }) {
    const { amount, destination, userId, extTrx } = params;
    const payoutUuid = uuidv4();
    const trx = extTrx || (await this.dbClient.transaction());

    await trx<Payout>("payout").insert({
      uuid: payoutUuid,
      amount: amount,
      status: "pending",
      destination: destination,
    });

    return payoutUuid;
  }

  async updatePayoutStatus(payoutUuid: string, status: "pending" | "completed" | "returned", extTrx?: Knex) {
    const trx = extTrx || (await this.dbClient.transaction());

    await trx<Payout>("payout")
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
        userId,
        trx,
      };
      const payoutUuid = await this.createPayout(createPayoutOptions);
      await this.walletService.takeMoneyFromWallet(createPayoutDto.amount, deepUserRecord.wallet.id, trx);
      await this.paymentServiceProvider.payoutToBank(createPayoutDto.amount, "todo: get_user_token");
      await this.updatePayoutStatus(payoutUuid, "completed", trx);

      await trx.commit();
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
