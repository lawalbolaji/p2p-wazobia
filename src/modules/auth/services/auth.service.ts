import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import debug from "debug";

const jwtSecret: string = process.env.JWT_SECRET!!;
const tokenExpirationInSeconds = 36000;
const log: debug.IDebugger = debug("app:auth-controller");

class AuthService {
  constructor() {}

  async createJWT(data: any) {
    try {
      const refreshId = data + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(16));
      const hash = crypto.createHmac("sha512", salt).update(refreshId).digest("base64");

      const refreshKey = salt.export();
      const token = jwt.sign(data, jwtSecret, {
        expiresIn: tokenExpirationInSeconds,
      });

      return { token, refreshToken: hash };
    } catch (err) {
      log("createJWT error: %O", err);
      throw err;
    }
  }
}

export default new AuthService();