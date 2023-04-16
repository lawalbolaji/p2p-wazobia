import express from "express";
import { UsersService } from "../services/users.service";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  getUserById = async (req: express.Request, res: express.Response) => {
    const details = await this.usersService.getUserById(req.body.id);
    if (!!details.success) return res.status(201).json(details);

    return res.status(400).json({ message: "request failed" });
  };

  async updateUser(req: express.Request, res: express.Response) {}

  async createUser(req: express.Request, res: express.Response) {
    const token = await this.usersService.create(req.body);
    if (!!token) return res.status(201).json({ token });

    return res.status(403).json({ message: "unable to create account" });
  }
}
