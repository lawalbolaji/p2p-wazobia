import { IsPositive, Min } from "class-validator";

export class CreatePayoutDto {
  @IsPositive()
  @Min(100)
  amount: number;

  constructor(params: { amount: number }) {
    this.amount = params.amount;
  }
}
