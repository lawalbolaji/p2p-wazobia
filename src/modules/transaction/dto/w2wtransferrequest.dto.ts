import { Type } from "class-transformer";
import { IsUUID, IsPositive, Min } from "class-validator";

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
