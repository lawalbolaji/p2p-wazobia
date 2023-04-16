import { format } from "date-fns";
import { Knex } from "knex";
import { BankAccount } from "../../../db_models/bank_account";
import { Entity } from "../../../db_models/entity";
import { v4 as uuidv4 } from "uuid";
import { PayeeBankAccountDetailsType } from "../../transaction/dto/w2bdebitrequest.dto";

export class BankAccountService {
  constructor() {}

  async fetchAccount(
    userUuid: string,
    trx: Knex,
    accountUuid?: string,
    payeeBankAccountDetailsType?: PayeeBankAccountDetailsType
  ) {
    let bankAccount: BankAccount;
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const bankUuid = uuidv4();

    if (!accountUuid && payeeBankAccountDetailsType?.AccountNumber) {
      await trx<Entity>("entity").insert({
        uuid: bankUuid,
        entity_type_id: 3, // bank_account
        created_at: timestamp,
        last_updated_at: timestamp,
      });
      const queryResult = await trx<Entity>("entity").select("id", "uuid").whereIn("uuid", [bankUuid, userUuid]);
      const [ownerEntity] = queryResult.filter((el) => el.uuid === userUuid);
      const [bankEntity] = queryResult.filter((el) => el.uuid === bankUuid);

      if (!ownerEntity) throw new Error(`unable to find owner entity record for userUuid: ${userUuid}`);

      await trx<BankAccount>("bank_account").insert({
        uuid: bankUuid,
        entity_id: bankEntity.id,
        owner_entity_id: ownerEntity.id,
        account_number: payeeBankAccountDetailsType?.AccountNumber,
      });

      bankAccount = (await trx<BankAccount>("bank_account").select("*").where({ uuid: bankUuid }))[0];
    } else {
      bankAccount = (
        await trx<BankAccount>("bank_account").select().where({ uuid: accountUuid }).whereNull("disabled_date")
      )[0];
    }

    if (!bankAccount) throw new Error("invalid bank account supplied");

    return bankAccount;
  }
}
