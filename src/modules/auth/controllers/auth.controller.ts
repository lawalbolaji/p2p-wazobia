import express from "express";
import debug from "debug";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const log: debug.IDebugger = debug("app:auth-controller");
const jwtSecret: string = process.env.JWT_SECRET!!;
const tokenExpirationInSeconds = 36000;

export class AuthController {
  constructor() {}

  async createJWT(req: express.Request, res: express.Response) {
    try {
      const refreshId = req.body.userId + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(+process.env.SALT_ROUNDS!!));
      const hash = crypto.createHmac("sha512", salt).update(refreshId).digest("base64");
      req.body.refreshKey = salt.export();
      
      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationInSeconds,
      });
      return res.status(201).send({ accessToken: token, refreshToken: hash });
    } catch (err) {
      log("createJWT error: %O", err);
      return res.status(500).send();
    }
  }
}
