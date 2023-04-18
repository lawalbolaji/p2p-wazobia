export class Charge {
  id: number;
  uuid: string;
  source: string; // token
  amount: number;
  user_id: string; // uuid of user that created this for auditing purposes
  created_at: string;
  last_updated_at: string;
  status: "pending" | "completed" | "returned";
}
