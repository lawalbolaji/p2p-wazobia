// import { WalletFundDto, WalletTransferDto, WalletWithdrawalDto } from "../../users/dto/wallet-transfer.dto";
// import { fetchAccount, fundWalletWithCard, tokenizeOrfetchCard, transferFunds, withdrawFromWalletToBank } from "../../wallet/wallet.service";
// import { Knex } from "knex";
// import { Wallet } from "../../../db_models/wallet";

import { format } from "date-fns";
import { Knex } from "knex";
import { BankAccount } from "../../../db_models/bank_account";
import { Card } from "../../../db_models/card";
import { Transaction } from "../../../db_models/transaction";
import { Wallet } from "../../../db_models/wallet";
import { DemoBankProcessor } from "../../payment/base.payment.service";
import { v4 as uuidv4 } from "uuid";

// export async function executeWalletTransfer(
//   walletTransferDto: WalletTransferDto,
//   userUuid: string,
//   walletUuid: string,
//   dbClient: Knex
// ) {
//   const trx = await dbClient.transaction();

//   try {
//     const deepUserRecord = await UsersService.fetchUserRecordDeep({ userUuid, walletUuid, trx });

//     const [destWallet] = await trx<Wallet>("wallet")
//       .select()
//       .where({ uuid: walletTransferDto.RecipientWalletId })
//       .whereNull("wallet.disabled_date");
//     if (!destWallet) throw new Error("invalid destination wallet id supplied");

//     await transferFunds(deepUserRecord.wallet, destWallet, walletTransferDto.Amount, trx);

//     await trx.commit();
//   } catch (error: any) {
//     logger.error(error?.message, error?.stack);

//     trx.rollback();
//     return { success: false, message: error?.message };
//   }

//   return { success: true };
// }

// export async function fundWallet(walletFundDto: WalletFundDto, userUuid: string, walletUuid: string, dbClient: Knex) {
//   const trx = await dbClient.transaction();

//   try {
//     const deepUserRecord = await UsersService.fetchUserRecordDeep({ userUuid, walletUuid, trx });

//     // TODO: consider creating an endpoint for them to tokenize the card
//     const card = await tokenizeOrfetchCard(
//       userUuid,
//       trx,
//       walletFundDto.PayerEntityUuid,
//       walletFundDto.PayerCardDetails
//     );
//     await fundWalletWithCard(card, deepUserRecord.wallet, walletFundDto.Amount, trx);

//     trx.commit();
//   } catch (error: any) {
//     logger.error(error?.message, error?.stack);

//     trx.rollback();
//     return { success: false };
//   }

//   return { success: true };
// }

// export async function withdrawFromWallet(
//   walletWithdrawalDto: WalletWithdrawalDto,
//   userUuid: string,
//   walletUuid: string,
//   dbClient: Knex
// ) {
//   const trx = await dbClient.transaction();

//   try {
//     const deepUserRecord = await UsersService.fetchUserRecordDeep({ userUuid, walletUuid, trx });
//     const bankAccount = await fetchAccount(
//       userUuid,
//       trx,
//       walletWithdrawalDto.PayeeEntityUuid,
//       walletWithdrawalDto.PayeeBankAccountDetails
//     );

//     await withdrawFromWalletToBank(deepUserRecord.wallet, bankAccount, walletWithdrawalDto.Amount, trx);

//     trx.commit();
//   } catch (error: any) {
//     logger.error(error?.message, error?.stack);

//     trx.rollback();
//     return { success: false, message: error?.message };
//   }

//   return { success: true };
// }

export async function transferFunds(sourceWallet: Wallet, destWallet: Wallet, amount: number, trx: Knex) {
  if (sourceWallet.balance < amount) throw new Error("insufficient balance");

  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const trxUuid = uuidv4();

  await trx<Transaction>("transaction").insert({
    uuid: trxUuid,
    payer_entity_id: sourceWallet.entity_id,
    payee_entity_id: destWallet.entity_id,
    amount,
    created_at: timestamp,
  });

  await trx<Wallet>("wallet")
    .update({ last_updated_at: timestamp, balance: trx.raw(`balance - ${amount}`) })
    .where({ id: sourceWallet.id });

  await trx<Wallet>("wallet")
    .update({ last_updated_at: timestamp, balance: trx.raw(`balance + ${amount}`) })
    .where({ id: destWallet.id });
}

export async function fundWalletWithCard(card: Card, destWallet: Wallet, amount: number, trx: Knex) {
  const paymentServiceProvider = new DemoBankProcessor();
  const trxUuid = uuidv4();

  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  await trx<Transaction>("transaction").insert({
    uuid: trxUuid,
    payer_entity_id: card.entity_id,
    payee_entity_id: destWallet.entity_id,
    amount,
    created_at: timestamp,
  });

  // TODO: integrate with actual processor to handle this
  paymentServiceProvider.processCardPayment();

  await trx<Wallet>("wallet")
    .update({ last_updated_at: timestamp, balance: trx.raw(`balance + ${amount}`) })
    .where({ id: destWallet.id });
}

export async function withdrawFromWalletToBank(
  sourceWallet: Wallet,
  destBankAccount: BankAccount,
  amount: number,
  trx: Knex
) {
  const paymentServiceProvider = new DemoBankProcessor();
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const trxUuid = uuidv4();

  if (sourceWallet.balance < amount) throw new Error("insufficient funds");

  await trx<Transaction>("transaction").insert({
    uuid: trxUuid,
    payer_entity_id: sourceWallet.entity_id,
    payee_entity_id: destBankAccount.entity_id,
    amount,
    created_at: timestamp,
  });

  // TODO: integrate with actual processor to handle this
  paymentServiceProvider.processBankTransfer();

  await trx<Wallet>("wallet")
    .update({ last_updated_at: timestamp, balance: trx.raw(`balance - ${amount}`) })
    .where({ id: sourceWallet.id });
}
