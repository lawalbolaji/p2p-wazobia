import { v4 as uuidv4 } from "uuid";
import { IPaymentServiceProvider, MockResponse } from "../base.payment.service";

export class DemoPaymentProcessor implements IPaymentServiceProvider {
  chargeSource(amount: number, token: string): Promise<{ amount: number; token: string; status: "success" }> {
    return this.simulateDelayedProcessing({ amount, token, status: "success" });
  }

  payoutToBank(amount: number, token: string): Promise<MockResponse> {
    return this.simulateDelayedProcessing({ amount, token, status: "success" });
  }

  tokenizeCard(...args: any): Promise<string> {
    const token = uuidv4();
    return this.simulateDelayedProcessing(token);
  }

  tokenizeBankAccount(...args: any): Promise<string> {
    const token = uuidv4();
    return this.simulateDelayedProcessing(token);
  }

  private simulateDelayedProcessing<T>(mockDataResponse: T): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const status = Math.random() * 10;
        if (status < 5) resolve(mockDataResponse);

        reject("Insufficient Balance");
      }, Math.random());
    });
  }
}
