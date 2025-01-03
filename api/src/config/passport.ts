import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import container from './container';

const initPassport = function () {
  const userService = container.resolve('userService')

  passport.use(new BearerStrategy(
    async function (token, done) {
      try {
        const user = await userService.loginByToken(token)
        return done(null, user, { scope: 'all' })
      } catch (err: any) {
        return done(err)
      }
    }
  ))
}

export { initPassport }
