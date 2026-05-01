import container from '../config/container';
import CacheService from '../services/CacheService';
import { handleError } from '../utils/users/helpers';

class CacheController {
  private cacheService: CacheService;
  private allowedOrigins = new Set(['localhost', 'sphere.score.us.es']);

  constructor() {
    this.cacheService = container.resolve('cacheService');
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
  }

  async get(req: any, res: any) {
    try {
      const originHeader = req.headers['x-origin'] || req.headers.origin;
      let hostname: string | null = null;

      if (originHeader) {
        try {
          hostname = new URL(originHeader).hostname;
        } catch {
          hostname = null;
        }
      }

      const isAllowedOrigin = hostname && this.allowedOrigins.has(hostname);
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isAllowedOrigin && !isAdmin) {
        return res.status(403).send({ error: 'PERMISSION ERROR: You are not allowed to access this resource. Either call this endpoint from a local environment, sphere.score.us.es, or login as ADMIN' });
      }

      const { key } = req.query;
      const data = await this.cacheService.get(key);

      res.status(200).json(data);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async set(req: any, res: any) {
    try {
      const originHeader = req.headers['x-origin'] || req.headers.origin;
      let hostname: string | null = null;

      if (originHeader) {
        try {
          hostname = new URL(originHeader).hostname;
        } catch {
          hostname = null;
        }
      }

      const isAllowedOrigin = hostname && this.allowedOrigins.has(hostname);

      const isAdmin = req.user?.role === 'ADMIN';

      if (!isAllowedOrigin && !isAdmin) {
        return res.status(403).send({ error: 'PERMISSION ERROR: You are not allowed to access this resource. Either call this endpoint from a local environment, sphere.score.us.es, or login as ADMIN' });
      }

      const { key, value, expirationInSeconds } = req.body;

      if (!expirationInSeconds) {
        await this.cacheService.set(key, value);
      } else {
        await this.cacheService.set(key, value, expirationInSeconds);
      }

      res.status(200).send({ message: 'Cache set successfully' });
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }
}

export default CacheController;
