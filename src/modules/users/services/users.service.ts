import debug from "debug";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";
import { User } from "../../../db_models/user";
import { Wallet } from "../../../db_models/wallet";
import { CreateUserDto } from "../dto/create.user.dto";
import { WalletService } from "../../wallet/services/wallet.service";
import { AuthService } from "../../auth/services/auth.service";
import { Entity } from "../../../db_models/entity";

dotenv.config();
const log: debug.IDebugger = debug("app:users-service");

export class UsersService {
  constructor(
    private readonly dbClient: Knex,
    private readonly walletService: WalletService,
    private readonly authService: AuthService
  ) {}

  async createUser(user_uuid: string, userDetails: CreateUserDto, trx: Knex) {
    return trx<User>("user").insert({
      email: userDetails.email,
      password: userDetails.password,
      first_name: userDetails.firstName,
      last_name: userDetails.lastName,
      uuid: user_uuid,
    });
  }

  async registerNewUser(userDetails: CreateUserDto): Promise<{ token: string; refreshToken: string } | false> {
    const user_uuid = uuidv4();

    try {
      await this.dbClient.transaction(async (trx: Knex) => {
        const [owner_entity_id] = await this.createUser(
          user_uuid,
          { ...userDetails, password: await this.authService.hashUserPassword(userDetails.password) },
          trx
        );
        await this.walletService.createNewUserWallet(owner_entity_id, trx);

        log(`Auth Request, account created for user with uuid: ${user_uuid}`);
      });
    } catch (error: any) {
      log(error?.message, error?.stack);

      return false;
    }

    return this.authService.createJWT({ userId: user_uuid });
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

  async fetchUserRecordDeep(args: { userUuid: string; trx: Knex }): Promise<{ user: User; wallet: Wallet }> {
    const { userUuid, trx } = args;
    const [deepUserRecord] = (await trx
      .from<User>("user")
      .innerJoin<Wallet>("wallet", "user.entity_id", "wallet.owner_entity_id")
      .options({
        nestTables: true,
      })
      .where(`user.uuid = ${userUuid}`)
      .whereNull("wallet.disabled_date")) as { user: User; wallet: Wallet }[];

    if (!deepUserRecord) throw new Error("no wallet found");

    return deepUserRecord;
  }

  async getUserByEmail(email: string) {
    const [user] = await this.dbClient<User>("user").select().where({ email });

    return { ...user, password: undefined };
  }

  async getUserByEmailWithPassword(email: string) {
    const [user] = await this.dbClient<User>("user").select().where({ email });

    return user;
  }

  async deleteById(id: string) {}
  async list(limit: number, page: number) {
    return [];
  }
}
