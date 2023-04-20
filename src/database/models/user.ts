// TODO: unfortunately, I have to manually update this everytime I make a schema update... Knexjs why😱????
export class User {
  id: number;
  uuid: string;
  entity_id: number;
  password: string;
  first_name?: string;
  last_name?: string;
  email: string;
  last_updated_at: string;
  created_at: string;
  disabled_date?: string;
}
