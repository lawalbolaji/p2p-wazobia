export class Transfer {
  id: number;
  uuid: string;
  source: string; // token
  destination: string;
  amount: number;
  created_at: string;
  last_updated_at: string;
  status: "pending" | "completed" | "returned";
}
