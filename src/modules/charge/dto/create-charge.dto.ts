import { Type } from "class-transformer";
import { IsPositive, Min } from "class-validator";
import { IsUUID } from "class-validator";

export class CreateChargeDto {
  @IsPositive()
  @Min(100)
  @Type(() => Number)
  amount: number;

  /*
    To call the charges endpoint, 
    you must tokenize your payment method in advance and provide the id token here
   */
  @IsUUID()
  source: string;

  constructor(params: { amount: number; source: string }) {
    this.amount = params.amount;
    this.source = params.source;
  }
}
