import container from "../config/container.ts";
import UserService from "../services/UserService.ts";
import { Request, Response } from "express";

class UserController {

  private userService: UserService;

  constructor() {
    this.userService = container.resolve("userService");
    this.getAll = this.getAll.bind(this);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userList = await this.userService.getAll();
      res.json(userList);
    } catch (err) {
      res.status(401).send({ errors: (err as Error).message });
    }
  }
}

export default UserController;