import debug from "debug";
import { Knex } from "knex";
import { BankAccount } from "../../../db_models/bankaccount";
import { UsersService } from "../../users/services/users.service";
import { CreatePayoutDto } from "../dto/create-payout.dto";
import { v4 as uuidv4 } from "uuid";
import { WalletService } from "../../wallet/services/wallet.service";
import { Payout } from "../../../db_models/payout";
import { DemoPaymentProcessor } from "../../payment/services/demo.payment.service";

const log: debug.IDebugger = debug("app:payout-service");

export class PayoutService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dbClient: Knex,
    private readonly walletService: WalletService
  ) {}

  async createNewPayout(createPayoutDto: CreatePayoutDto, userId: string) {
    let paymentServiceProvider: DemoPaymentProcessor | null = new DemoPaymentProcessor();
    const trx = await this.dbClient.transaction();
    const payoutUuid = uuidv4();

    try {
      const deepUserRecord = await this.usersService.fetchUserRecordDeep({ userUuid: userId, trx });
      if (deepUserRecord.wallet.balance < createPayoutDto.amount) throw new Error("Insufficient Balance");

      const [ownerBankAccount] = await this.dbClient<BankAccount>("bankaccount").where(
        "owner_entity_id",
        deepUserRecord.user.entity_id
      );
      if (!ownerBankAccount) throw new Error("user has no bank account on record");

      await this.dbClient.insert<Payout>({
        uuid: payoutUuid,
        amount: createPayoutDto.amount,
        status: "pending",
        destination: ownerBankAccount.uuid,
      });

      await this.walletService.takeMoneyFromWallet(createPayoutDto.amount, deepUserRecord.wallet.id, trx);
      await paymentServiceProvider.payoutToBank(createPayoutDto.amount, "todo: get_user_token");

      await this.dbClient<Payout>("payout")
        .update({
          status: "completed",
        })
        .where("uuid", payoutUuid);
      paymentServiceProvider = null; // submit for garbage collection
    } catch (error: any) {
      log(error?.message, error?.stack);

      throw error;
    }
  }

  getPayoutDetailsById() {}

  // paginate this
  searchAllPayouts() {}
}
