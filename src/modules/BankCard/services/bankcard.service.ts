import { format } from "date-fns";
import { Knex } from "knex";
import { Card } from "../../../db_models/card";
import { Entity } from "../../../db_models/entity";
import { v4 as uuidv4 } from "uuid";
import { PayerCardDetailsType } from "../../transaction/dto/c2wcreditrequest.dto";

export class BankCardService {
  constructor() {}

  async tokenizeOrfetchCard(
    userUuid: string,
    trx: Knex,
    accountUuid?: string,
    payerCardDetailsType?: PayerCardDetailsType
  ) {
    let card: Card;
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const cardUuid = uuidv4();

    if (!accountUuid) {
      await trx<Entity>("entity").insert({
        uuid: cardUuid,
        entity_type_id: 4, // card
        created_at: timestamp,
        last_updated_at: timestamp,
      });
      const queryResult = await trx<Entity>("entity").select("id", "uuid").whereIn("uuid", [cardUuid, userUuid]);
      const [ownerEntity] = queryResult.filter((el) => el.uuid === userUuid);
      const [cardEntity] = queryResult.filter((el) => el.uuid === cardUuid);

      if (!ownerEntity) throw new Error(`unable to find owner entity record for userUuid: ${userUuid}`);

      await trx<Card>("card").insert({
        uuid: cardUuid,
        entity_id: cardEntity.id,
        owner_entity_id: ownerEntity.id,
        cardholder_firstName: payerCardDetailsType?.CardholderFirstName,
        cardholder_lastName: payerCardDetailsType?.CardholderLastName,
        card_cvv: payerCardDetailsType?.Cvv,
        card_expiration: payerCardDetailsType?.ExpirationDate,
        card_number: payerCardDetailsType?.CardNumber,
        card_pin: payerCardDetailsType?.Pin,
      });

      card = (await trx<Card>("card").select("*").where({ uuid: cardUuid }))[0];
    } else {
      card = (await trx<Card>("card").select("*").where({ uuid: accountUuid }).whereNull("disabled_date"))[0];
    }

    if (!card) throw new Error("invalid card details supplied");

    return card;
  }
}
