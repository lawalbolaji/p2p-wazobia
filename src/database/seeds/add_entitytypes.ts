import { Knex } from "knex";
import { EntityType } from "../models/entitytype";

export async function seed(knex: Knex): Promise<void> {
  const entityTypes = await knex<EntityType>("entitytype").where({});
  if (entityTypes.length > 0) return;

  return knex<EntityType>("entitytype").then(function () {
    return knex<EntityType>("entitytype").insert([
      { id: 1, description: "user" },
      { id: 2, description: "wallet" },
      { id: 3, description: "card" },
      { id: 4, description: "bankaccount" },
    ]);
  });
}
