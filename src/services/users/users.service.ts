import chalk from "chalk";
import { knex as dbClient } from "../../configs/knex";
import { logger } from "../../configs/logger";
import { WalletFundDto, WalletTransferDto, WalletWithdrawalDto } from "./dtos/wallet-transfer.dto";
import { fundWalletWithCard, transferFunds, withdrawFromWalletToBank } from "../wallet/wallet.service";
import { Wallet } from "../../models/wallet";
import { BankAccount } from "../../models/bank_account";

export async function executeWalletTransfer(walletTransferDto: WalletTransferDto, userUuid: string, walletUuid: string) {
  const trx = await dbClient.transaction();

  try {
    const deepUserRecord = await trx
      .from("User")
      .innerJoin("wallet", "user.entity_id", "wallet.owner_entity_id")
      .options({
        nestTables: true,
      })
      .where({ "user.uuid": userUuid })
      .whereNotNull("disabled_date");
    if (!deepUserRecord.length) throw new Error("no wallet found");

    const destWallet = await trx<Wallet>("wallet").select().where({ uuid: walletTransferDto.RecipientWalletId }).whereNotNull("disabled_date");
    if (!destWallet.length || deepUserRecord[0].wallet.uuid !== walletUuid) throw new Error("invalid destination wallet id supplied");

    await transferFunds(deepUserRecord[0].wallet, destWallet[0].id, walletTransferDto.Amount, trx);

    await trx.commit();
  } catch (error: any) {
    logger.log(chalk.red(error?.message, error?.stack));

    trx.rollback();
    return { failure: true };
  }

  return { success: true };
}

export async function fundWallet(walletFundDto: WalletFundDto, userUuid: string, walletUuid: string) {
  const trx = await dbClient.transaction();
  try {
    const deepUserRecord = await trx
      .from("User")
      .innerJoin("wallet", "user.entity_id", "wallet.owner_entity_id")
      .options({
        nestTables: true,
      })
      .where({ "user.uuid": userUuid })
      .whereNotNull("disabled_date");
    if (!deepUserRecord.length || deepUserRecord[0].wallet.uuid !== walletUuid) throw new Error("no wallet found");

    // TODO: tokenize card if new card is provided
    const card = { id: 1 };

    await fundWalletWithCard(card, deepUserRecord[0].wallet.id, walletFundDto.Amount, trx);

    trx.commit();
  } catch (error: any) {
    logger.log(chalk.red(error?.message, error?.stack));

    trx.rollback();
    return { failure: true };
  }

  return { success: false };
}

export async function withdrawFromWallet(walletWithdrawalDto: WalletWithdrawalDto, userUuid: string, walletUuid: string) {
  const trx = await dbClient.transaction();
  try {
    const deepUserRecord = await trx
      .from("User")
      .innerJoin("wallet", "user.entity_id", "wallet.owner_entity_id")
      .options({
        nestTables: true,
      })
      .where({ "user.uuid": userUuid })
      .whereNotNull("disabled_date");
    if (!deepUserRecord.length || deepUserRecord[0].wallet.uuid !== walletUuid) throw new Error("no wallet found");

    // TODO: tokenize bank if new one is provided
    const bankAccount: BankAccount = new BankAccount();

    await withdrawFromWalletToBank(deepUserRecord[0].wallet, bankAccount, walletWithdrawalDto.Amount, trx);

    trx.commit();
  } catch (error: any) {
    logger.log(chalk.red(error?.message, error?.stack));

    trx.rollback();
    return { failure: true };
  }

  return { success: false };
}
