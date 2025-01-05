
import { NextFunction } from 'express';
import container from '../config/container';

const hasRole = (...roles: string[]) => (req: any, res: any, next: NextFunction) => {
  if (!req.user) {
    return res.status(403).send({ error: 'Not logged in' })
  }
  if (!roles.includes(req.user.userType)) {
    return res.status(403).send({ error: 'Not enough privileges' })
  }
  return next()
}

const isLoggedIn = async (req: any, res: any, next: NextFunction) => {
  const userService = container.resolve('userService');
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ error: 'No authorization header found' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Invalid authorization header. Remeber to use `Bearer {token}`' });
  }

  const token = authHeader.split(' ')[1];

  try{
    const user = await userService.loginByToken(token);
    req.user = user;
    next();
  }catch(err){
    return res.status(401).send({ error: (err as Error).message });
  }

}

export { hasRole, isLoggedIn }
