export class Transfer {
  id: number;
  uuid: string;
  source_wallet_id: number; // walletId
  destination_wallet_id: number;
  amount: number;
  user_entity_id: number; // uuid of user that made this transfer, for auditing purposes
  created_at: string;
  last_updated_at: string;
  status: "pending" | "completed" | "returned";
}
