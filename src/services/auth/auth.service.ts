import { knex } from "../../configs/knex";
import { User } from "../../models/user";
import { UserDetailsDto } from "./dtos/userdetails.dto";
import { v4 as uuidv4 } from "uuid";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

export async function createNewUser(userDetails: UserDetailsDto) {
  const timestamp: string = new Date().toString();
  const saltRounds = 10; // TODO: probably ship to env
  const hashedPassword = await bcrypt.hash(userDetails.Password, saltRounds);
  const uuid = uuidv4();

  await knex.transaction(async (trx: any) => {
    try {
      await knex<User>("User").transacting(trx).insert({
        email: userDetails.Email,
        password: hashedPassword,
        first_name: userDetails.FirstName,
        last_name: userDetails.LastName,
        created_at: timestamp,
        last_updated_at: timestamp,
        uuid,
      });

      trx.commit();
    } catch (error) {
      trx.rollback();
      // TODO: use logger for prod
      console.log("erorr creating user");

      throw error;
    }
  });

  return jwt.sign({ uuid }, process.env.JWT_SECRET || "");
}

export async function loginUser(userDetails: UserDetailsDto) {
  // get user details
  const user = await knex<User>("User")
    .select()
    .where({ email: userDetails.Email });
  const isCorrectPassword = await bcrypt.compare(
    userDetails.Password,
    user[0].password
  );

  if (!isCorrectPassword) throw new Error("invalid email or password supplied");

  return jwt.sign({ uuid: user[0].uuid }, process.env.JWT_SECRET || "");
}

export async function disableUser() {}
