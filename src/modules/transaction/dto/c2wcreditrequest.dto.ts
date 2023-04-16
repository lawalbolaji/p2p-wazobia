import { Type } from "class-transformer";
import { IsPositive, Min, ValidateIf, IsOptional } from "class-validator";
import { IsUUID, ValidateNested, IsString, IsDateString } from "class-validator";

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

  constructor(params: {
    CardholderFirstName: string;
    CardholderLastName: string;
    CardNumber: string;
    Cvv: string;
    Pin: string;
    ExpirationDate: string;
  }) {
    this.CardholderFirstName = params.CardholderFirstName;
    this.CardholderLastName = params.CardholderLastName;
    this.CardNumber = params.CardNumber;
    this.Cvv = params.Cvv;
    this.Pin = params.Pin;
    this.ExpirationDate = params.ExpirationDate;
  }
}
