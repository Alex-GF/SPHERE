import container from '../config/container';
import UserService from '../services/UserService';
import { LeanUser, UserFilters } from '../types/models/User';
import { handleError } from '../utils/users/helpers';

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = container.resolve('userService');
    this.index = this.index.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.show = this.show.bind(this);
    this.destroy = this.destroy.bind(this);
    this.update = this.update.bind(this);
    this.updateToken = this.updateToken.bind(this);
  }

  async index(req: any, res: any) {
    try {
      const queryParamas = req.query;
      if (req.user.role !== 'ADMIN') {
        throw new Error('PERMISSION ERROR: Only ADMIN users can access the full list of users.');
      }
      const users = await this.userService.index(queryParamas);
      res.json(users);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async show(req: any, res: any) {
    // Only returns PUBLIC information of if reqUser ask for another username
    try {
      const targetUsername = req.params.username;
      const user = await this.userService.show(targetUsername);

      if (req.user.username === targetUsername || req.user.role === "ADMIN") {
        return res.json(user);
      } else {
        const propertiesToBeRemoved = [
          'password',
          'createdAt',
          'updatedAt',
          'token',
          'tokenExpiration',
          'phone',
          'role',
          'email',
          'address',
          'postalCode'
        ];

        const userObject = Object.assign({}, user);
        propertiesToBeRemoved.forEach(property => {
          delete (userObject as Record<string, any>)[property];
        });

        res.json(userObject);
      }
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async register(req: any, res: any) {
    try {
      const registeredUser = await this.userService.register(req.body, req.user);

      res.status(201).json(registeredUser);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async login(req: any, res: any) {
    try {
      const user: LeanUser = await this.userService.login(req.body.loginField, req.body.password);

      res.json({ token: user.token });
    } catch (err: any) {
      if (err.message.toLowerCase().includes('invalid credentials')) {
        return res.status(401).send({ error: err.message });
      } else {
        const { status, message } = handleError(err);
        res.status(status).send({ error: message });
      }
    }
  }

  async update(req: any, res: any) {
    try {
      const user = await this.userService.update(req.user, req.params.username, req.body);
      res.json(user);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async updateToken(req: any, res: any) {
    try {
      const token = await this.userService.updateToken(req.params.username, req.user);
      res.json(token);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async destroy(req: any, res: any) {
    try {
      const result = await this.userService.destroy(req.user, req.params.username);
      const message = result ? 'Successfully deleted.' : 'Could not delete user.';
      res.json({ message });
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }
}

export default UserController;
