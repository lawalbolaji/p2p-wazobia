import debug from "debug";
import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";
import { User } from "../../../database/models/user";
import { Wallet } from "../../../database/models/wallet";
import { CreateUserDto } from "../dto/create.user.dto";
import { WalletService } from "../../wallet/services/wallet.service";
import { AuthService } from "../../auth/services/auth.service";
import { Entity } from "../../../database/models/entity";

const log: debug.IDebugger = debug("app:users-service");

export class UsersService {
  constructor(private readonly dbClient: Knex, private readonly walletService: WalletService, private readonly authService: AuthService) {}

  async createUser(userDetails: CreateUserDto, trx: Knex) {
    const userUuid = uuidv4();

    await trx<User>("user").insert({
      email: userDetails.email,
      password: userDetails.password,
      first_name: userDetails.firstName,
      last_name: userDetails.lastName,
      uuid: userUuid,
    });

    return userUuid;
  }

  async registerNewUser(userDetails: CreateUserDto): Promise<{ token: string; refreshToken: string } | false> {
    let userUuid: string | null = null;
    try {
      await this.dbClient.transaction(async (trx: Knex) => {
        log("creating user");
        const hashedUserPassword = await this.authService.hashUserPassword(userDetails.password);
        userUuid = await this.createUser({ ...userDetails, password: hashedUserPassword }, trx);

        const [ownerEntity] = await trx<Entity>("entity").where("uuid", userUuid);
        await this.walletService.createNewUserWallet(ownerEntity.id, trx);

        log(`Auth Request: account created for user with uuid: ${userUuid}`);
      });

      return this.authService.createJWT({ userId: userUuid! });
    } catch (error: any) {
      log(error?.message, error?.stack);
      console.log(error)

      return false;
    }
  }

  async getUserById(userUuid: string) {
    try {
      const deepUserRecord = await this.fetchUserRecordDeep({ userUuid: userUuid });

      return {
        _id: deepUserRecord.user.uuid,
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

      return false;
    }
  }

  async fetchUserRecordDeep(args: { userUuid: string; trx?: Knex.Transaction }): Promise<deepUserRecord> {
    const { userUuid, trx } = args;
    const localTrx = trx || (await this.dbClient.transaction());

    const [deepUserRecord] = (await localTrx
      .from<User>("user")
      .innerJoin<Wallet>("wallet", "user.entity_id", "wallet.owner_entity_id")
      .options({
        nestTables: true,
      })
      .where(`user.uuid`, "=", `${userUuid}`)
      .whereNull("wallet.disabled_date")) as { user: User; wallet: Wallet }[];

    if (!trx) await localTrx.commit();

    if (!deepUserRecord) throw new Error("no wallet found");

    return deepUserRecord;
  }

  async getUserByEmail(email: string) {
    const [user] = await this.dbClient<User>("user").where({ email });
    if (!user) return undefined;

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

type deepUserRecord = {
  user: User;
  wallet: Wallet;
};
