import container from '../config/container';
import CacheService from '../services/CacheService';

class CacheController {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = container.resolve('cacheService');
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
  }

  async get(req: any, res: any) {
    try {
      const { key } = req.query;
      const data = await this.cacheService.get(key);
      res.json(data);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async set(req: any, res: any) {
    try {
      const { key, value, expirationInSeconds } = req.body;
      if (!expirationInSeconds){
        await this.cacheService.set(key, value);
      }else{
        await this.cacheService.set(key, value, expirationInSeconds);
      }
      res.status(200).send({ message: 'Cache set successfully' });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }
}

export default CacheController;
