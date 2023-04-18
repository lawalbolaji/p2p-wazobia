import { IsEnum, IsString, MaxLength } from "class-validator";

enum BankAccountType {
  savings = "savings",
  current = "current",
}

export class CreateBankAccountDto {
  @IsString()
  @MaxLength(10)
  AccountNumber: string;

  @IsString()
  BankName: string;

  @IsEnum(BankAccountType)
  BankAccountType: BankAccountType;

  constructor(params: { AccountNumber: string; BankName: string; BankAccountType: BankAccountType }) {
    this.AccountNumber = params.AccountNumber;
    this.BankName = params.BankName;
    this.BankAccountType = params.BankAccountType;
  }
}
