/**
 * assumptions:
 * 1. account can only be funded via card through an external processor
 * 2. withdrawals will be done to a bank account through an external processor
 */
export interface IPaymentServiceProvider {
  processBankTransfer(): boolean;
  processCardPayment(): boolean;
}

export class DemoBankProcessor implements IPaymentServiceProvider {
  processBankTransfer() {
    return true;
  }
  processCardPayment() {
    return true;
  }
}
