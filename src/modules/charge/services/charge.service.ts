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
    private readonly walletService: WalletService,
    private readonly paymentServiceProvider: DemoPaymentProcessor
  ) {}

  async createCharge(params: { source: string; amount: number; userEntityId: number; extTrx?: Knex }) {
    const { amount, source, userEntityId: userEntityId, extTrx } = params;
    const trx = extTrx || (await this.dbClient.transaction());
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

  async updateChargeStatus(chargeUuid: string, status: "pending" | "completed" | "returned", extTrx?: Knex) {
    const trx = extTrx || (await this.dbClient.transaction());

    await trx<Charge>("charge")
      .update({
        status,
      })
      .where("uuid", chargeUuid);
  }

  async executeCharge(createChargeDto: CreateChargeDto, userId: string) {
    const iTrx = await this.dbClient.transaction();
    let chargeUuid: string | null = null;
    let chargeSourceResult: {
      amount: number;
      token: string;
      status: "success";
    } | null = null;

    try {
      const deepUserRecord = await this.usersService.fetchUserRecordDeep({ userUuid: userId, trx: iTrx });
      try {
        const createChargeOptions = {
          amount: createChargeDto.amount,
          source: createChargeDto.source,
          userEntityId: deepUserRecord.user.entity_id,
          iTrx,
        };
        chargeUuid = await this.createCharge(createChargeOptions);
        chargeSourceResult = await this.paymentServiceProvider.chargeSource(
          createChargeDto.amount,
          createChargeDto.source
        );

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
            await this.walletService.addMoneyToWallet(createChargeDto.amount, deepUserRecord.wallet.id, trx);

            if (chargeUuid === null) throw new Error("error completing request");
            await this.updateChargeStatus(chargeUuid, "completed", trx);

            trx.commit();
          } catch (error: any) {
            log(error?.message, error?.stack);

            trx.rollback();
            // TODO: do a refund, since this will have a charge record that never completed
          }
          return {
            _id: chargeUuid,
            amount: chargeSourceResult.amount,
            status: chargeSourceResult.status,
          };
        }
      } catch (error: any) {
        log(error?.message, error?.stack);
        throw error;
      }
    } catch (error) {}
  }

  async getChargeDetails() {}
  async listCharges() {}
}
