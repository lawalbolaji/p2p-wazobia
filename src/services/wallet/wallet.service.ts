import { Knex } from "knex";
import { Transaction } from "../../models/transaction";
import { Wallet } from "../../models/wallet";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { DemoBankProcessor } from "../payment/base.payment.service";
import { BankAccount } from "../../models/bank_account";

export async function transferFunds(sourceWallet: Wallet, destWalletId: number, amount: number, trx: Knex) {
  if (sourceWallet.balance < amount) throw new Error("insufficient balance");

  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  await trx<Transaction>("transaction").insert({
    uuid: uuidv4(),
    payer_entity_id: sourceWallet.id,
    payee_entity_id: destWalletId,
    amount,
    created_at: timestamp,
  });

  await trx<Wallet>("wallet")
    .update({ last_updated_at: timestamp, balance: trx.raw(`balance - ${amount}`) })
    .where({ id: sourceWallet.id });

  await trx<Wallet>("wallet")
    .update({ last_updated_at: timestamp, balance: trx.raw(`balance + ${amount}`) })
    .where({ id: destWalletId });
}

export async function fundWalletWithCard(card: any, destWallet: Wallet, amount: number, trx: Knex) {
  const paymentServiceProvider = new DemoBankProcessor();

  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  await trx<Transaction>("transaction").insert({
    uuid: uuidv4(),
    payer_entity_id: card.id,
    payee_entity_id: destWallet.id,
    amount,
    created_at: timestamp,
  });

  // TODO: integrate with actual processor to handle this
  paymentServiceProvider.processCardPayment();

  await trx<Wallet>("wallet")
    .update({ last_updated_at: timestamp, balance: trx.raw(`balance + ${amount}`) })
    .where({ id: destWallet.id });
}

export async function withdrawFromWalletToBank(sourceWallet: Wallet, destBankAccount: BankAccount, amount: number, trx: Knex) {
  const paymentServiceProvider = new DemoBankProcessor();

  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  await trx<Transaction>("transaction").insert({
    uuid: uuidv4(),
    payer_entity_id: sourceWallet.id,
    payee_entity_id: destBankAccount.id,
    amount,
    created_at: timestamp,
  });

  // TODO: integrate with actual processor to handle this
  paymentServiceProvider.processBankTransfer();

  await trx<Wallet>("wallet")
    .update({ last_updated_at: timestamp, balance: trx.raw(`balance - ${amount}`) })
    .where({ id: sourceWallet.id });
}
