import { Type } from "class-transformer";
import { IsPositive, Min, ValidateIf, IsOptional, IsUUID, ValidateNested, IsString, MaxLength } from "class-validator";

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

  constructor(params: {
    PayeeEntityUuid: string;
    Amount: number;
    PayeeBankAccountDetails: PayeeBankAccountDetailsType;
  }) {
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
