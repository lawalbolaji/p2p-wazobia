import { IPaymentServiceProvider, MockResponse } from "../base.payment.service";

export class DemoPaymentProcessor implements IPaymentServiceProvider {
  chargeSource(amount: number, token: string): Promise<{ amount: number; token: string; status: "success" }> {
    return this.simulateDelayedProcessing({ amount, token, status: "success" });
  }

  payoutToBank(amount: number, token: string): Promise<MockResponse> {
    return this.simulateDelayedProcessing({ amount, token, status: "success" });
  }

  private simulateDelayedProcessing(mockDataResponse: MockResponse): Promise<MockResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const status = Math.random() * 10;
        if (status < 5)
          resolve({ amount: mockDataResponse.amount, token: mockDataResponse.token, status: mockDataResponse.status });

        reject("Insufficient Balance");
      }, Math.random());
    });
  }
}
