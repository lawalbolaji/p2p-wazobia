import debug from "debug";
import { Knex } from "knex";
import { CreateChargeDto } from "../dto/create-charge.dto";
import { UsersService } from "../../users/services/users.service";
import { WalletService } from "../../wallet/services/wallet.service";
import { Charge } from "../../../db_models/charge";
import { v4 as uuidv4 } from "uuid";
import { DemoPaymentProcessor } from "../../payment/services/demo.payment.service";

const log: debug.IDebugger = debug("app:charge-service");

// TODO: need to work on a refund logic as well
export class ChargeService {
  constructor(
    private readonly dbClient: Knex,
    private readonly usersService: UsersService,
    private readonly walletService: WalletService
  ) {}

  async createNewCharge(createChargeDto: CreateChargeDto, userId: string) {
    const iTrx = await this.dbClient.transaction();
    const chargeUuid = uuidv4();
    let chargeSourceResult: {
      amount: number;
      token: string;
      status: "success";
    } | null = null;

    try {
      await iTrx<Charge>("charge").insert({
        uuid: chargeUuid,
        source: createChargeDto.source,
        amount: createChargeDto.amount,
        status: "pending",
      });
      const paymentServiceProvider = new DemoPaymentProcessor();
      chargeSourceResult = await paymentServiceProvider.chargeSource(createChargeDto.amount, createChargeDto.source);

      iTrx.commit();
    } catch (error: any) {
      iTrx.rollback();

      log(error?.message, error?.stack);
      throw error;
    }

    try {
      // update wallet balance
      if (!!chargeSourceResult && chargeSourceResult.status === "success") {
        const trx = await this.dbClient.transaction();

        try {
          const deepUserRecord = await this.usersService.fetchUserRecordDeep({ userUuid: userId, trx });
          await this.walletService.addMoneyToWallet(createChargeDto.amount, deepUserRecord.wallet.id, trx);

          await trx<Charge>("charge")
            .update({
              status: "completed",
            })
            .where("uuid", chargeUuid);

          trx.commit();
        } catch (error: any) {
          log(error?.message, error?.stack);

          trx.rollback();
          // do a refund, since this will have a charge record with status pending
        }
        return {
          _id: "charge_id",
          amount: chargeSourceResult.amount,
          status: chargeSourceResult.status,
        };
      }
    } catch (error: any) {
      log(error?.message, error?.stack);
      throw error;
    }
  }

  async getChargeDetails() {}
  async listCharges() {}
}
