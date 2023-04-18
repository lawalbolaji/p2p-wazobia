export class Payout {
  id: number;
  uuid: string;
  amount: number;
  destination: string; //token
  user_id: number; // for auditing purposes
  created_at: string;
  last_updated_at: string;
  status: "pending" | "completed" | "returned";
}
