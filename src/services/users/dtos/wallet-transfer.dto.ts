import { Type } from "class-transformer";
import { IsDateString, IsOptional, IsPositive, IsString, IsUUID, MaxLength, Min, ValidateIf, ValidateNested } from "class-validator";
import "reflect-metadata";

export class WalletTransferDto {
  @IsUUID()
  RecipientWalletId: string;

  @IsPositive()
  @Min(100) // all arithmetic operations will be done in lower unit (kobo) and minimum value we'll accept is 1 naira
  @Type(() => Number)
  Amount: number;

  constructor(params: { RecipientWalletId: string; Amount: number }) {
    this.RecipientWalletId = params.RecipientWalletId;
    this.Amount = params.Amount;
  }
}

export class WalletFundDto {
  @IsPositive()
  @Min(100)
  @Type(() => Number)
  Amount: number;

  @ValidateIf((obj: WalletFundDto) => !obj.PayerCardDetails)
  @IsOptional()
  @IsUUID()
  PayerEntityUuid?: string; // for previously tokenized cards

  @ValidateIf((obj: WalletFundDto) => !obj.PayerEntityUuid)
  @IsOptional()
  @ValidateNested()
  PayerCardDetails?: PayerCardDetailsType;

  constructor(params: { PayerEntityUuid: string; Amount: number; PayerCardDetails: PayerCardDetailsType }) {
    this.PayerEntityUuid = params.PayerEntityUuid;
    this.PayerCardDetails = new PayerCardDetailsType({ ...params.PayerCardDetails });
    this.Amount = params.Amount;
  }
}

export class PayerCardDetailsType {
  @IsString()
  CardholderFirstName: string;

  @IsString()
  CardholderLastName: string;

  @IsString()
  CardNumber: string;

  @IsString()
  Cvv: string;

  @IsString()
  Pin: string;

  @IsDateString()
  ExpirationDate: string;

  constructor(params: { CardholderFirstName: string; CardholderLastName: string; CardNumber: string; Cvv: string; Pin: string; ExpirationDate: string }) {
    this.CardholderFirstName = params.CardholderFirstName;
    this.CardholderLastName = params.CardholderLastName;
    this.CardNumber = params.CardNumber;
    this.Cvv = params.Cvv;
    this.Pin = params.Pin;
    this.ExpirationDate = params.ExpirationDate;
  }
}

export class WalletWithdrawalDto {
  @IsPositive()
  @Min(100)
  @Type(() => Number)
  Amount: number;

  @ValidateIf((obj: WalletWithdrawalDto) => !obj.PayeeBankAccountDetails)
  @IsOptional()
  @IsUUID()
  PayeeEntityUuid?: string; // for previously tokenized accounts

  @ValidateIf((obj: WalletWithdrawalDto) => !obj.PayeeEntityUuid)
  @IsOptional()
  @ValidateNested()
  PayeeBankAccountDetails?: PayeeBankAccountDetailsType;

  constructor(params: { PayeeEntityUuid: string; Amount: number; PayeeBankAccountDetails: PayeeBankAccountDetailsType }) {
    this.PayeeEntityUuid = params.PayeeEntityUuid;
    this.PayeeBankAccountDetails = new PayeeBankAccountDetailsType({ ...params.PayeeBankAccountDetails });
    this.Amount = params.Amount;
  }
}

export class PayeeBankAccountDetailsType {
  @IsString()
  @MaxLength(10)
  AccountNumber: string;

  @IsString()
  BankName: string;

  @IsString()
  BankAccountType: string;

  constructor(params: { AccountNumber: string; BankName: string; BankAccountType: string }) {
    this.AccountNumber = params.AccountNumber;
    this.BankName = params.BankName;
    this.BankAccountType = params.BankAccountType;
  }
}
