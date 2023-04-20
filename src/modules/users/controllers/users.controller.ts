import express from "express";
import { UsersService } from "../services/users.service";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  getUserById = async (req: express.Request, res: express.Response) => {
    const details = await this.usersService.getUserById(res.locals.jwt.userId);
    if (!!details) return res.status(201).json(details);

    return res.status(400).json({ message: "request failed" });
  };

  async updateUser(req: express.Request, res: express.Response) {}

  async createUser(req: express.Request, res: express.Response) {
    const token = await this.usersService.registerNewUser(req.body);
    if (!!token) return res.status(201).json(token);

    return res.status(403).json({ message: "unable to create account" });
  }
}
