// TODO: unfortunately, I have to manually update this everytime I make a schema update... Knexjs why😱????
export interface User {
  id: number;
  uuid: string;
  password: string;
  first_name?: string;
  last_name?: string;
  email: string;
  last_updated_at: string;
  created_at: string;
  disabled_date: string | null;
}
