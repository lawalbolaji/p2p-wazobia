import express from "express";
import debug from "debug";
import dotenv from "dotenv";
import { AuthService } from "../services/auth.service";

dotenv.config();
const log: debug.IDebugger = debug("app:auth-controller");

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async createJWT(req: express.Request, res: express.Response) {
    try {
      const response = await this.authService.createJWT(req.body);
      return res.status(201).send(response);
    } catch (err) {
      log("createJWT error: %O", err);
      return res.status(500).send();
    }
  }
}
