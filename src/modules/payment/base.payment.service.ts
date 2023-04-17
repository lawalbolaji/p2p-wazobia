export interface IPaymentServiceProvider {
  chargeSource(...args: any): Promise<MockResponse>;
  payoutToBank(...agrs: any): Promise<MockResponse>;
}

export type MockResponse = {
  amount: number;
  token: string;
  status: "success";
};
