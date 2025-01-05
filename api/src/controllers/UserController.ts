import container from '../config/container.js'
import UserService from '../services/UserService.js';

class UserController {

  private userService: UserService;

  constructor () {
    this.userService = container.resolve('userService')
    this.loginAdmin = this.loginAdmin.bind(this)
    this.loginUser = this.loginUser.bind(this)
    this.loginByToken = this.loginByToken.bind(this)
    this.show = this.show.bind(this)
    this.registerUser = this.registerUser.bind(this)
    this.registerAdmin = this.registerAdmin.bind(this)
    this.destroy = this.destroy.bind(this)
    this.update = this.update.bind(this)
  }

  async registerUser (req: any, res: any) {
    this._register(req, res, 'user')
  }

  async registerAdmin (req: any, res: any) {
    this._register(req, res, 'admin')
  }

  async _register (req: any, res: any, userType: "user" | "admin") {
    try {
      let registeredUser
      if (userType === 'admin') {
        registeredUser = await this.userService.registerAdmin(req.body)
      } else if (userType === 'user') {
        registeredUser = await this.userService.registerUser(req.body)
      }
      res.status(201).json(registeredUser)
    } catch (err: any) {
      if (err.name.includes('ValidationError') || err.code === 11000) {
        res.status(422).send(err)
      } else {
        res.status(500).send(err.message)
      }
    }
  }

  async loginByToken (req: any, res: any) {
    try {
      this.userService.loginByToken(req.body.token).then((user) => {
        res.json(user)
      }).catch((err) => {
        res.status(401).send({ errors: err.message })
      })
    } catch (err: any) {
      return res.status(401).send({ errors: err.message })
    }
  }

  async loginAdmin (req: any, res: any) {
    try {
      const user = await this.userService.loginAdmin(req.body.email, req.body.password)
      res.json({token: user!.token})
    } catch (err: any) {
      return res.status(401).send({ errors: err.message })
    }
  }

  async loginUser (req: any, res: any) {
    try {
      const user = await this.userService.loginUser(req.body.email, req.body.password)
      res.json({token: user!.token})
    } catch (err: any) {
      return res.status(401).send({ errors: err.message })
    }
  }

  async show (req: any, res: any) {
  // Only returns PUBLIC information of users
    try {
      const user = await this.userService.show(req.params.userId)
      res.json(user)
    } catch (err: any) {
      res.status(500).send(err.message)
    }
  }

  async update (req: any, res: any) {
    try {
      const user = await this.userService.update((req as any).user.id, req.body)
      res.json(user)
    } catch (err: any) {
      res.status(500).send(err.message)
    }
  }

  async destroy (req: any, res: any) {
    try {
      const result = await this.userService.destroy((req as any).user.id)
      const message = result ? 'Successfully deleted.' : 'Could not delete user.'
      res.json(message)
    } catch (err: any) {
      res.status(500).send(err.message)
    }
  }
}

export default UserController
