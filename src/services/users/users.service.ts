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
import { User } from "../../models/user";

export async function executeWalletTransfer(walletTransferDto: WalletTransferDto, userUuid: string, walletUuid: string, dbClient: Knex) {
  const trx = await dbClient.transaction();

  try {
    const deepUserRecord = await fetchUserRecordDeep({ userUuid, walletUuid, trx });

    const [destWallet] = await trx<Wallet>("wallet").select().where({ uuid: walletTransferDto.RecipientWalletId }).whereNull("wallet.disabled_date");
    if (!destWallet) throw new Error("invalid destination wallet id supplied");

    await transferFunds(deepUserRecord.wallet, destWallet, walletTransferDto.Amount, trx);

    await trx.commit();
  } catch (error: any) {
    logger.error(error?.message, error?.stack);

    trx.rollback();
    return { success: false, message: error?.message };
  }

  return { success: true };
}

export async function fundWallet(walletFundDto: WalletFundDto, userUuid: string, walletUuid: string, dbClient: Knex) {
  const trx = await dbClient.transaction();

  try {
    const deepUserRecord = await fetchUserRecordDeep({ userUuid, walletUuid, trx });

    // TODO: consider creating an endpoint for them to tokenize the card
    const card = await tokenizeOrfetchCard(userUuid, trx, walletFundDto.PayerEntityUuid, walletFundDto.PayerCardDetails);
    await fundWalletWithCard(card, deepUserRecord.wallet, walletFundDto.Amount, trx);

    trx.commit();
  } catch (error: any) {
    logger.error(error?.message, error?.stack);

    trx.rollback();
    return { success: false };
  }

  return { success: true };
}

export async function withdrawFromWallet(walletWithdrawalDto: WalletWithdrawalDto, userUuid: string, walletUuid: string, dbClient: Knex) {
  const trx = await dbClient.transaction();

  try {
    const deepUserRecord = await fetchUserRecordDeep({ userUuid, walletUuid, trx });
    const bankAccount = await fetchAccount(userUuid, trx, walletWithdrawalDto.PayeeEntityUuid, walletWithdrawalDto.PayeeBankAccountDetails);

    await withdrawFromWalletToBank(deepUserRecord.wallet, bankAccount, walletWithdrawalDto.Amount, trx);

    trx.commit();
  } catch (error: any) {
    logger.error(error?.message, error?.stack);

    trx.rollback();
    return { success: false, message: error?.message };
  }

  return { success: true };
}

async function fetchUserRecordDeep(args: { userUuid: string; walletUuid?: string; trx: Knex }): Promise<{ user: User; wallet: Wallet }> {
  const { userUuid, walletUuid, trx } = args;
  const [deepUserRecord] = (await trx
    .from("user")
    .innerJoin("wallet", "user.entity_id", "wallet.owner_entity_id")
    .options({
      nestTables: true,
    })
    .where({ "user.uuid": userUuid })
    .whereNull("wallet.disabled_date")) as { user: User; wallet: Wallet }[];
  if (!deepUserRecord || (!!walletUuid && deepUserRecord.wallet.uuid !== walletUuid)) throw new Error("no wallet found");

  return deepUserRecord;
}

async function fetchAccount(userUuid: string, trx: Knex, accountUuid?: string, payeeBankAccountDetailsType?: PayeeBankAccountDetailsType) {
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
    bankAccount = (await trx<BankAccount>("bank_account").select().where({ uuid: accountUuid }).whereNull("disabled_date"))[0];
  }

  if (!bankAccount) throw new Error("invalid bank account supplied");

  return bankAccount;
}

async function tokenizeOrfetchCard(userUuid: string, trx: Knex, accountUuid?: string, payerCardDetailsType?: PayerCardDetailsType) {
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

export async function fetchUserDetails(userUuid: string, dbClient: Knex) {
  try {
    const deepUserRecord = await fetchUserRecordDeep({ userUuid, trx: dbClient });

    return {
      success: true,
      userUuid: userUuid,
      first_name: deepUserRecord.user.first_name,
      last_name: deepUserRecord.user.last_name,
      wallet: {
        uuid: deepUserRecord.wallet.uuid,
        balance: deepUserRecord.wallet.balance,
        last_updated_at: deepUserRecord.wallet.last_updated_at,
      },
    };
  } catch (error: any) {
    logger.error(error?.message, error?.stack);

    return { success: false };
  }
}
