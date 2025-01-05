import container from '../config/container.js'
import PricingService from '../services/PricingService';

class PricingController {

  private pricingService: PricingService;

  constructor () {
    this.pricingService = container.resolve('pricingService');
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  async index (req: any, res: any) {
    try {
      const pricings = await this.pricingService.index()
      res.json(pricings)
    } catch (err: any) {
      res.status(500).send(err.message)
    }
  }

  async show (req: any, res: any) {
    try {
      const pricing = await this.pricingService.show(req.params.pricingName)
      res.json(pricing)
    } catch (err: any) {
      res.status(500).send(err.message)
    }
  }

  async destroy (req: any, res: any) {
    try {
      const result = await this.pricingService.destroy(req.params.pricingId)
      const message = result ? 'Successfully deleted.' : 'Could not delete pricing.'
      res.json(message)
    } catch (err: any) {
      res.status(500).send(err.message)
    }
  }
}

export default PricingController
