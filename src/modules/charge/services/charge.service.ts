import debug from "debug";
import { Knex } from "knex";
import { CreateChargeDto } from "../dto/create-charge.dto";
import { UsersService } from "../../users/services/users.service";
import { WalletService } from "../../wallet/services/wallet.service";
import { Charge } from "../../../db_models/charge";
import { v4 as uuidv4 } from "uuid";
import { DemoPaymentProcessor } from "../../payment/services/demo.payment.service";
import { MockResponse } from "../../payment/base.payment.service";

const log: debug.IDebugger = debug("app:charge-service");

// TODO: need to work on a refund logic as well
export class ChargeService {
  constructor(
    private readonly dbClient: Knex,
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
    private readonly paymentServiceProvider: DemoPaymentProcessor
  ) {}

  async createCharge(params: { source: string; amount: number; userEntityId: number; trx: Knex.Transaction }) {
    const { amount, source, userEntityId: userEntityId, trx } = params;
    const chargeUuid = uuidv4();

    await trx<Charge>("charge").insert({
      uuid: chargeUuid,
      source,
      amount,
      status: "pending",
      user_entity_id: userEntityId,
    });

    return chargeUuid;
  }

  updateChargeStatus(chargeUuid: string, status: "pending" | "completed" | "returned", trx: Knex.Transaction) {
    return trx<Charge>("charge")
      .update({
        status,
      })
      .where("uuid", chargeUuid);
  }

  async executeCharge(createChargeDto: CreateChargeDto, userId: string) {
    const chargeTokenTrx = await this.dbClient.transaction();

    try {
      log("fetching user records for: %0", userId);
      const deepUserRecord = await this.usersService.fetchUserRecordDeep({ userUuid: userId, trx: chargeTokenTrx });
      const createChargeOptions = {
        amount: createChargeDto.amount,
        source: createChargeDto.source,
        userEntityId: deepUserRecord.user.entity_id,
        trx: chargeTokenTrx,
      };

      log("creating charge record");
      const chargeUuid = await this.createCharge(createChargeOptions);

      log("calling external payment processor to debit token");
      const chargeSourceResult = await this.paymentServiceProvider.chargeSource(createChargeDto.amount, createChargeDto.source);
      await chargeTokenTrx.commit();

      // update wallet balance
      log("creating new Transaction for local wallet update");
      const updateLocalWalletTrx = await this.dbClient.transaction();
      try {
        log("adding money to wallet");
        await this.walletService.addMoneyToWallet(createChargeDto.amount, deepUserRecord.wallet.id, updateLocalWalletTrx);

        log("updating charge status to completed");
        await this.updateChargeStatus(chargeUuid, "completed", updateLocalWalletTrx);

        log("local wallet balance updated");
        await updateLocalWalletTrx.commit();

        return {
          _id: chargeUuid,
          amount: chargeSourceResult.amount,
          status: chargeSourceResult.status,
        };
      } catch (error: any) {
        // TROUBLE: we have a potential wrongful debit situation because or database did not update the user wallet,
        // even though the external service has charged their token¸
        log(error?.message, error?.stack);

        await updateLocalWalletTrx.rollback();
      }
    } catch (error: any) {
      await chargeTokenTrx.rollback();

      log(error?.message, error?.stack);
      throw error;
    }
  }

  async getChargeDetails() {}
  async listCharges() {}
}
