import { Knex } from "knex";
import { Wallet } from "../../../db_models/wallet";
import { v4 as uuidv4 } from "uuid";

export class WalletService {
  constructor(private readonly dbClient: Knex) {}

  getWalletBalance(walletId: string) {}

  async getWalletByOwnerEntityId(owner_entity_id: number) {
    const [wallet] = await this.dbClient<Wallet>("wallet").where("owner_entity_id", owner_entity_id);

    return wallet;
  }

  async getWalletById(walletId: string, extTrx?: Knex) {
    const [wallet] = await this.dbClient<Wallet>("wallet").where("uuid", walletId);

    return wallet;
  }

  createNewUserWallet(owner_entity_id: number, trx: Knex) {
    const wallet_uuid = uuidv4();

    return trx<Wallet>("wallet").insert({
      uuid: wallet_uuid,
      balance: 0,
      owner_entity_id,
    });
  }

  addMoneyToWallet(amount: number, walletId: number, trx: Knex.Transaction) {
    return trx<Wallet>("wallet")
      .update({ balance: trx.raw(`balance + ${amount}`) })
      .where({ id: walletId });
  }

  takeMoneyFromWallet(amount: number, walletId: number, trx: Knex.Transaction) {
    return trx<Wallet>("wallet")
      .update({ balance: trx.raw(`balance - ${amount}`) })
      .where({ id: walletId });
  }
}
