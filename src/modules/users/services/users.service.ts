import { CreateUserDto } from "../dto/create.user.dto";
import { Knex } from "knex";
import { User } from "../../../db_models/user";
import { Wallet } from "../../../db_models/wallet";
import { format } from "date-fns";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { Entity } from "../../../db_models/entity";
import * as jwt from "jsonwebtoken";
import debug from "debug";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const log: debug.IDebugger = debug("app:users-service");
const jwtSecret: string = process.env.JWT_SECRET!!;
const tokenExpirationInSeconds = process.env.TTL || 36000;

export class UsersService {
  constructor(private readonly dbClient: Knex) {}

  async create(userDetails: CreateUserDto): Promise<string | false> {
    const timestamp: string = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const saltRounds = +(process.env.SALT_ROUNDS || 10);
    const hashedPassword = await bcrypt.hash(userDetails.password, saltRounds);
    const user_uuid = uuidv4();
    const wallet_uuid = uuidv4();

    try {
      await this.dbClient.transaction(async (trx: Knex) => {
        await trx<Entity>("entity").insert({
          uuid: user_uuid,
          entity_type_id: 1, // user
          created_at: timestamp,
          last_updated_at: timestamp,
        });
        const [userEntity] = await trx<Entity>("entity").select("*").where({ uuid: user_uuid });

        await trx<User>("user").insert({
          email: userDetails.email,
          password: hashedPassword,
          first_name: userDetails.firstName,
          last_name: userDetails.lastName,
          created_at: timestamp,
          last_updated_at: timestamp,
          uuid: user_uuid,
          entity_id: userEntity.id,
        });

        await trx<Entity>("entity").insert({
          uuid: wallet_uuid,
          entity_type_id: 2, // wallet
          created_at: timestamp,
          last_updated_at: timestamp,
        });
        const [walletEntity] = await trx<Entity>("entity").select("*").where({ uuid: wallet_uuid });

        await trx<Wallet>("wallet").insert({
          uuid: wallet_uuid,
          balance: 0,
          owner_entity_id: userEntity.id,
          last_updated_at: timestamp,
          entity_id: walletEntity.id,
        });
      });

      log(`Auth Request, account created for user with uuid: ${user_uuid}`);
    } catch (error: any) {
      log(error?.message, error?.stack);

      return false;
    }

    const refreshId = user_uuid + jwtSecret;
    const salt = crypto.createSecretKey(crypto.randomBytes(+process.env.SALT_ROUNDS!!));
    const hash = crypto.createHmac("sha512", salt).update(refreshId).digest("base64");

    return jwt.sign({ uuid: user_uuid, refreshKey: salt.export() }, process.env.JWT_SECRET!!, {
      expiresIn: tokenExpirationInSeconds,
    });
  }

  async deleteById(id: string) {}
  async list(limit: number, page: number) {
    return [];
  }

  async getUserById(id: string) {
    try {
      const deepUserRecord = await this.fetchUserRecordDeep({ userUuid: id, trx: this.dbClient });

      return {
        success: true,
        userUuid: id,
        first_name: deepUserRecord.user.first_name,
        last_name: deepUserRecord.user.last_name,
        wallet: {
          uuid: deepUserRecord.wallet.uuid,
          balance: deepUserRecord.wallet.balance,
          last_updated_at: deepUserRecord.wallet.last_updated_at,
        },
      };
    } catch (error: any) {
      log(error?.message, error?.stack);

      return { success: false };
    }
  }

  async fetchUserRecordDeep(args: {
    userUuid: string;
    walletUuid?: string;
    trx: Knex;
  }): Promise<{ user: User; wallet: Wallet }> {
    const { userUuid, walletUuid, trx } = args;
    const [deepUserRecord] = (await trx
      .from("user")
      .innerJoin("wallet", "user.entity_id", "wallet.owner_entity_id")
      .options({
        nestTables: true,
      })
      .where({ "user.uuid": userUuid })
      .whereNull("wallet.disabled_date")) as { user: User; wallet: Wallet }[];
    if (!deepUserRecord || (!!walletUuid && deepUserRecord.wallet.uuid !== walletUuid))
      throw new Error("no wallet found");

    return deepUserRecord;
  }

  async getUserByEmail(email: string) {
    const [user] = await this.dbClient<User>("user").select().where({ email });

    // TODO: construct what we want to give client
    return user;
  }

  async getUserByEmailWithPassword(email: string) {
    const [user] = await this.dbClient<User>("user").select().where({ email });

    return user;
  }
}
