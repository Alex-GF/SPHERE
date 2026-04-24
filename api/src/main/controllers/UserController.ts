import container from '../config/container';
import UserService from '../services/UserService';
import { handleError } from '../utils/users/helpers';

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = container.resolve('userService');
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.show = this.show.bind(this);
    this.destroy = this.destroy.bind(this);
    this.update = this.update.bind(this);
    this.updateToken = this.updateToken.bind(this);
  }

  async show(req: any, res: any) {
    // Only returns PUBLIC information of users
    try {
      const user = await this.userService.show(req.params.username);
      res.json(user);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async register(req: any, res: any) {
    try {
      let registeredUser;

      registeredUser = await this.userService.register(req.body, req.user);
      res.status(201).json(registeredUser);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async login(req: any, res: any) {
    try {
      const user = await this.userService.login(req.body.loginField, req.body.password);
      res.json(user);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
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
      const token = await this.userService.updateToken(req.user.token);
      res.json(token);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async destroy(req: any, res: any) {
    try {
      const result = await this.userService.destroy(req.user.username, req.params.username);
      const message = result ? 'Successfully deleted.' : 'Could not delete user.';
      res.json({ message });
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }
}

export default UserController;
