import debug from "debug";
import { Knex } from "knex";
import { CreateBankAccountDto } from "../dto/createbankaccount.dto";
import { Entity } from "../../../db_models/entity";
import { BankAccount } from "../../../db_models/bankaccount";
import { DemoPaymentProcessor } from "../../payment/services/demo.payment.service";

const log: debug.IDebugger = debug("app:bankaccount-service");

export class BankAccountService {
  constructor(private readonly dbClient: Knex, private readonly paymentServiceProvider: DemoPaymentProcessor) {}

  async createUserBankAccount(createBankAccountDto: CreateBankAccountDto, userId: string) {
    const trx = await this.dbClient.transaction();
    try {
      const account = await this.getUserBankAccount(userId, trx);
      if (account !== undefined) throw new Error("user bank account already exists");

      const token = await this.paymentServiceProvider.tokenizeBankAccount(createBankAccountDto);
      const [userEntity] = await trx<Entity>("entity").where("uuid", userId);
      await trx<BankAccount>("bankaccount").insert({
        ext_token: token,
        owner_entity_id: userEntity.id,
        last4: createBankAccountDto.AccountNumber.slice(-4),
      });

      await trx.commit();

      return { token };
    } catch (error: any) {
      await trx.rollback();

      log("error: %0", error);
      throw error;
    }
  }

  async getUserBankAccount(userId: string, extTrx?: Knex) {
    const trx = extTrx || (await this.dbClient.transaction());
    const [userEntity] = await trx<Entity>("entity").where("uuid", userId);
    const [bankAccount] = await trx<BankAccount>("bankaccount").where("owner_entity_id", userEntity.id);

    return bankAccount;
  }
}
