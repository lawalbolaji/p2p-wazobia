export class Charge {
  id: number;
  uuid: string;
  source: string; // token
  amount: number;
  user_entity_id: number;
  created_at: string;
  last_updated_at: string;
  status: "pending" | "completed" | "returned";
}
