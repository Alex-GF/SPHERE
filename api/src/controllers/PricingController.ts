import fs from 'fs';
import container from '../config/container.js'
import PricingService from '../services/PricingService';
import path from 'path';

class PricingController {

  private pricingService: PricingService;

  constructor () {
    this.pricingService = container.resolve('pricingService');
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.create = this.create.bind(this);
  }

  async index (req: any, res: any) {
    try {
      // const queryParams = req.query;
      const pricings = await this.pricingService.index()
      res.json(pricings)
    } catch (err: any) {
      res.status(500).send({error: err.message})
    }
  }

  async show (req: any, res: any) {
    try {
      const pricing = await this.pricingService.show(req.params.pricingName)
      res.json(pricing)
    } catch (err: any) {
      res.status(500).send({error: err.message})
    }
  }

  async create (req: any, res: any) {
    try {
      const pricing = await this.pricingService.create(req.file)
      res.json(pricing)
    } catch (err: any) {
      const file = req.file;
      const directory = path.dirname(file.path);
      if (fs.readdirSync(directory).length === 1) {
        fs.rmdirSync(directory, { recursive: true });
      }else{
        fs.rmSync(file.path);
      }
      res.status(500).send({error: err.message})
    }
  }

  // async destroy (req: any, res: any) {
  //   try {
  //     const result = await this.pricingService.destroy(req.params.pricingId)
  //     const message = result ? 'Successfully deleted.' : 'Could not delete pricing.'
  //     res.json(message)
  //   } catch (err: any) {
  //     res.status(500).send(err.message)
  //   }
  // }
}

export default PricingController
