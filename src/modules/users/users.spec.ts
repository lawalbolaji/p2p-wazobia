import supertest from "supertest";
import { expect } from "chai";
import { v4 as uuidv4 } from "uuid";
import { CreateUserDto } from "./dto/create.user.dto";
import jwt_decode from "jwt-decode";
import express from "express";
import * as http from "http";
import { loadRoutes } from "../../factory/routes.factory";
import * as knexConfig from "../../database/knexfile";
import { Knex } from "knex";

let firstUserIdTest = "";
const firstUserBody: CreateUserDto = {
  email: `rasheed.lawal+${uuidv4().slice(-10)}@noemail.com`,
  password: "p@ssw0rd!t3",
};

let accessToken = "";
let refreshToken = "";

describe("users and auth endpoints", function () {
  const app: express.Application = express();
  app.use(express.json());
  const server = http.createServer(app);
  let request: supertest.SuperAgentTest;
  let dbClient: Knex;

  beforeAll((done) => {
    dbClient = require("knex")(knexConfig);
    loadRoutes(app, dbClient);

    server.listen(process.env.PORT);
    request = supertest.agent(server);
    done();
  });

  afterAll(async () => {
    await server.close();
    await dbClient.destroy();
  });

  it("should allow a POST to /users", async () => {
    const res = await request.post(`/users`).send(firstUserBody);

    expect(res.status).to.equal(201);
    expect(res.body).not.to.be.empty;
    expect(res.body).to.be.an("object");
    expect(res.body.token).to.be.a("string");
    expect(res.body.refreshToken).to.be.a("string");

    firstUserIdTest = jwt_decode<{ userId: string }>(res.body.token).userId;
  });

  it("should allow a POST to /auth", async function () {
    const res = await request.post(`/auth`).send(firstUserBody);
    expect(res.status).to.equal(201);
    expect(res.body).not.to.be.empty;
    expect(res.body).to.be.an("object");
    expect(res.body.token).to.be.a("string");
    expect(res.body.refreshToken).to.be.a("string");
    accessToken = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  it("should allow a GET from /users/:userId with an access token", async function () {
    const res = await request
      .get(`/users/${firstUserIdTest}`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send();
    expect(res.status).to.equal(200);
    expect(res.body).not.to.be.empty;
    expect(res.body).to.be.an("object");
    expect(res.body._id).to.be.a("string");
    expect(res.body._id).to.equal(firstUserIdTest);
  });
});
