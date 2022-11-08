import chalk from "chalk";
import { knex as dbClient } from "../../configs/knex";
import { logger } from "../../configs/logger";
import { PayeeBankAccountDetailsType, PayerCardDetailsType, WalletFundDto, WalletTransferDto, WalletWithdrawalDto } from "./dtos/wallet-transfer.dto";
import { fundWalletWithCard, transferFunds, withdrawFromWalletToBank } from "../wallet/wallet.service";
import { Wallet } from "../../models/wallet";
import { BankAccount } from "../../models/bank_account";
import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";
import { Entity } from "../../models/entity";
import { format } from "date-fns";
import { Card } from "../../models/card";

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

    const card = await tokenizeOrfetchCard(userUuid, trx, walletFundDto.PayerEntityUuid, walletFundDto.PayerCardDetails);
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

    const bankAccount = await fetchAccount(userUuid, trx, walletWithdrawalDto.PayeeEntityUuid, walletWithdrawalDto.PayeeBankAccountDetails);
    await withdrawFromWalletToBank(deepUserRecord[0].wallet, bankAccount, walletWithdrawalDto.Amount, trx);

    trx.commit();
  } catch (error: any) {
    logger.log(chalk.red(error?.message, error?.stack));

    trx.rollback();
    return { failure: true };
  }

  return { success: false };
}

async function fetchAccount(userUuid: string, trx: Knex, accountUuid?: string, payeeBankAccountDetailsType?: PayeeBankAccountDetailsType) {
  let bankAccount: BankAccount;
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  if (!accountUuid) {
    const [entity] = await trx<Entity>("entity")
      .insert({
        uuid: uuidv4(),
        entity_type_id: 3, // bank_account
        created_at: timestamp,
        last_updated_at: timestamp,
      })
      .returning("id");

    const [ownerEntity] = await trx<Entity>("entity").select("id").where({ uuid: userUuid });
    if (!ownerEntity) throw new Error(`unable to find owner entity record for userUuid: ${userUuid}`);

    bankAccount = (
      await trx<BankAccount>("bank_account")
        .insert({
          uuid: uuidv4(),
          entity_id: entity.id,
          owner_entity_id: ownerEntity.id,
          account_number: payeeBankAccountDetailsType?.AccountNumber,
        })
        .returning("*")
    )[0];
  } else {
    bankAccount = (await trx<BankAccount>("bank_account").select().where({ uuid: accountUuid }).whereNotNull("disabled_date"))[0];
  }

  if (!bankAccount) throw new Error("invalid bank account supplied");

  return bankAccount;
}

async function tokenizeOrfetchCard(userUuid: string, trx: Knex, accountUuid?: string, payerCardDetailsType?: PayerCardDetailsType) {
  let card: Card;
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  if (!accountUuid) {
    const [entity] = await trx<Entity>("entity")
      .insert({
        uuid: uuidv4(),
        entity_type_id: 4, // card
        created_at: timestamp,
        last_updated_at: timestamp,
      })
      .returning("id");

    const [ownerEntity] = await trx<Entity>("entity").select("id").where({ uuid: userUuid });
    if (!ownerEntity) throw new Error(`unable to find owner entity record for userUuid: ${userUuid}`);

    card = (
      await trx<Card>("card")
        .insert({
          uuid: uuidv4(),
          entity_id: entity.id,
          owner_entity_id: ownerEntity.id,
          cardholder_firstName: payerCardDetailsType?.CardholderFirstName,
          cardholder_lastName: payerCardDetailsType?.CardholderLastName,
          card_cvv: payerCardDetailsType?.Cvv,
          card_expiration: payerCardDetailsType?.ExpirationDate,
          card_number: payerCardDetailsType?.CardNumber,
          card_pin: payerCardDetailsType?.Pin,
        })
        .returning("*")
    )[0];
  } else {
    card = (await trx<Card>("card").select().where({ uuid: accountUuid }).whereNotNull("disabled_date"))[0];
  }

  if (!card) throw new Error("invalid card details supplied");

  return card;
}
