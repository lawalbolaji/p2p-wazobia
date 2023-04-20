import { v4 as uuidv4 } from "uuid";
import { IPaymentServiceProvider, MockResponse } from "../base.payment.service";

export class DemoPaymentProcessor implements IPaymentServiceProvider {
  chargeSource(amount: number, token: string): Promise<MockResponse> {
    return this.simulateDelayedProcessing({ amount, token, status: "success" }, "Insufficient Balance💸");
  }

  payoutToBank(amount: number, token: string): Promise<MockResponse> {
    return this.simulateDelayedProcessing({ amount, token, status: "success" }, "Issuer or Switch Inoperative🤣");
  }

  tokenizeCard(...args: any): Promise<string> {
    const token = uuidv4();
    return this.simulateDelayedProcessing(token, "cannot reach tokenization service");
  }

  tokenizeBankAccount(...args: any): Promise<string> {
    const token = uuidv4();
    return this.simulateDelayedProcessing(token, "cannot reach tokenization service");
  }

  private simulateDelayedProcessing<T>(mockDataResponse: T, errorMessage?: string): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const status = Math.random() * 10;
        if (status < 5) resolve(mockDataResponse);

        reject(errorMessage);
      }, Math.random());
    });
  }
}
