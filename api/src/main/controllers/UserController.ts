import container from '../config/container';
import UserService from '../services/UserService';

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
      res.status(500).send({ error: err.message });
    }
  }

  async register(req: any, res: any) {
    try {
      let registeredUser;

      registeredUser = await this.userService.register(req.body, req.user);
      res.status(201).json(registeredUser);
    } catch (err: any) {
      if (err.message.toLowerCase().includes('permission error')) {
        res.status(403).send({ error: err.message });
      } else if (err.message.toLowerCase().includes('invalid data')) {
        res.status(422).send({ error: err.message });
      } else {
        res.status(500).send({ error: err.message });
      }
    }
  }

  async login(req: any, res: any) {
    try {
      const user = await this.userService.login(req.body.loginField, req.body.password);
      res.json(user);
    } catch (err: any) {
      if (err.message.toLowerCase().includes('invalid data')) {
        return res.status(401).send({ error: err.message });
      }
      return res.status(500).send({ error: err.message });
    }
  }

  async update(req: any, res: any) {
    try {
      const user = await this.userService.update(req.user, req.params.username, req.body);
      res.json(user);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async updateToken(req: any, res: any) {
    try {
      const token = await this.userService.updateToken(req.user.token);
      res.json(token);
    } catch (err: any) {
      if (err.message.toLowerCase().includes('token')) {
        res.status(401).send({ error: err.message });
      } else {
        res.status(500).send({ error: err.message });
      }
    }
  }

  async destroy(req: any, res: any) {
    try {
      const result = await this.userService.destroy(req.user.username, req.params.username);
      const message = result ? 'Successfully deleted.' : 'Could not delete user.';
      res.json(message);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }
}

export default UserController;
