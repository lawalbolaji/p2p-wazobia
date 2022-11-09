import knex from "knex";
import dotenv from "dotenv";
import { loginUser, createNewUser } from "./auth.service";
import * as bcrypt from "bcrypt";

const knexTest = jest.mock("knex");

describe("auth test", () => {
  let JWT_SECRET: string;
  let TTL: string;
  let SALT_ROUNDS: number;
  let Email: string;
  let Password: string;

  beforeEach(() => {
    JWT_SECRET = "secret_key_for_test";
    TTL = "10s";
    SALT_ROUNDS = 10;
    Email = "test_email";
    Password = "test_password";
  });

  it("should create user and return access token", async () => {
    const queryBuilder = {
      where: jest.fn().mockImplementation(({ email }) => (!!email ? [] : [{ id: 1 }])),
      insert: jest.fn().mockReturnValue([{ id: 2 }]),
      select: jest.fn().mockReturnThis(),
    };
    const knexClient: any = jest.fn().mockReturnValue(queryBuilder);
    knexClient.transaction = jest.fn().mockImplementation((trxScope: any) => trxScope(knexClient));

    const token = await createNewUser({ Email, Password }, knexClient as any, { env: { JWT_SECRET, TTL, SALT_ROUNDS } } as unknown as NodeJS.Process);

    expect(knexClient.transaction).toBeCalled();

    expect(knexClient).toBeCalledWith("user");
    expect(knexClient).toBeCalledWith("entity");
    expect(knexClient).toBeCalledWith("wallet");

    expect(queryBuilder.select).toBeCalledTimes(3);
    expect(queryBuilder.where).toBeCalledTimes(3);
    expect(queryBuilder.insert).toBeCalledTimes(4);

    expect(token).toBeTruthy();
  });

  it("should login user and return access token", async () => {
    const hashedPassword = await bcrypt.hash(Password, SALT_ROUNDS);
    const queryBuilder = {
      where: jest.fn().mockReturnValue([{ password: hashedPassword, uuid: "" }]),
      select: jest.fn().mockReturnThis(),
    };
    const knexClient: any = jest.fn().mockReturnValue(queryBuilder);
    knexClient.transaction = jest.fn().mockImplementation((trxScope: any) => trxScope(knexClient));

    const token = await loginUser({ Email, Password }, knexClient as any, { env: { JWT_SECRET, TTL, SALT_ROUNDS } } as unknown as NodeJS.Process);

    expect(knexClient).toBeCalledWith("user");
    expect(queryBuilder.select).toBeCalledTimes(1);
    expect(queryBuilder.where).toBeCalledTimes(1);

    expect(token).toBeTruthy();
  });
});
