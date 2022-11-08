import { knex } from "../../configs/knex";
import { Knex } from "knex";
import { User } from "../../models/user";
import { UserDetailsDto } from "./dtos/userdetails.dto";
import { v4 as uuidv4 } from "uuid";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { format } from "date-fns";
import { logger } from "../../configs/logger";
import chalk from "chalk";

export async function createNewUser(userDetails: UserDetailsDto): Promise<string | false> {
  const timestamp: string = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const saltRounds = 10; // TODO: probably ship to env
  const hashedPassword = await bcrypt.hash(userDetails.Password, saltRounds);
  const uuid = uuidv4();

  try {
    await knex.transaction(async (trx: Knex) => {
      // check if email already exists
      const users = await knex<User>("user").select().where({ email: userDetails.Email });
      if (users.length) throw new Error("email already exists");

      await trx<User>("User").insert({
        email: userDetails.Email,
        password: hashedPassword,
        first_name: userDetails.FirstName,
        last_name: userDetails.LastName,
        created_at: timestamp,
        last_updated_at: timestamp,
        uuid,
      });
    });

    logger.log(chalk.green(`[Server]: Auth Request, account created for user with uuid: ${uuid}`));
  } catch (error: any) {
    logger.error(error?.message, error?.stack);

    return false;
  }

  return jwt.sign({ uuid }, process.env.JWT_SECRET || "", { expiresIn: process.env.TTL || "10h" });
}

export async function loginUser(userDetails: UserDetailsDto): Promise<string | false> {
  try {
    const users = await knex<User>("user").select().where({ email: userDetails.Email });

    // TODO: add unique key index to email column
    if (users.length) {
      const isCorrectPassword = await bcrypt.compare(userDetails.Password, users[0].password);

      if (isCorrectPassword) {
        logger.log(chalk.green(`[Server]: Auth Request, user with uuid: ${users[0].uuid} logged in`));

        return jwt.sign({ uuid: users[0].uuid }, process.env.JWT_SECRET || "", { expiresIn: process.env.TTL || "10h" });
      }
    }

    return false;
  } catch (error: any) {
    logger.error(error?.message, error?.stack);

    return false;
  }
}

// TODO: might come in handy
export async function disableUser() {}
