export class CreatePayoutDto {
  amount: number;

  constructor(params: { amount: number }) {
    this.amount = params.amount;
  }
}
