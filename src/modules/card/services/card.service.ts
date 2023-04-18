import debug from "debug";
import { Knex } from "knex";
import { Card } from "../../../db_models/card";
import { Entity } from "../../../db_models/entity";
import { CreateCardDto } from "../dto/createcard.dto";
import { DemoPaymentProcessor } from "../../payment/services/demo.payment.service";

const log: debug.IDebugger = debug("app:card-service");

export class CardService {
  constructor(private readonly dbClient: Knex) {}

  async createCard(createCardDto: CreateCardDto, userId: string) {
    let paymentServiceProvider: DemoPaymentProcessor | null = new DemoPaymentProcessor();

    const trx = await this.dbClient.transaction();
    try {
      const token = await paymentServiceProvider.tokenizeCard(createCardDto);
      const [userEntity] = await trx<Entity>("entity").where("uuid", userId);
      await trx<Card>("card").insert({
        ext_token: token,
        owner_entity_id: userEntity.id,
        last4: createCardDto.CardNumber.slice(-4),
      });

      await trx.commit();
      paymentServiceProvider = null;

      return {
        token,
      };
    } catch (error: any) {
      await trx.rollback();

      log(error?.message, error?.stack);
    }
  }

  async listUserCards() {}
}
