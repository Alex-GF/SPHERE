import container from '../config/container.js'
import PricingCollectionService from '../services/PricingCollectionService.js';

class PricingCollectionController {

  private pricingCollectionService: PricingCollectionService;

  constructor () {
    this.pricingCollectionService = container.resolve('pricingCollectionService');
    this.index = this.index.bind(this);
    this.showByNameAndUserId = this.showByNameAndUserId.bind(this);
    this.showByUserId = this.showByUserId.bind(this);
    // this.show = this.show.bind(this);
    // this.create = this.create.bind(this);
  }

  async index (req: any, res: any) {
    try {
      const pricings = await this.pricingCollectionService.index()
      res.json(pricings)
    } catch (err: any) {
      res.status(500).send({error: err.message})
    }
  }

  async showByNameAndUserId (req: any, res: any) {
    try {
      const collection = await this.pricingCollectionService.showByNameAndUserId(req.params.collectionName, req.params.userId)
      res.json(collection)
    } catch (err: any) {
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404).send({error: err.message})
      }else{
        res.status(500).send({error: err.message})
      }
    }
  }

  async showByUserId (req: any, res: any) {
    try {
      console.log(req.user)
      const collections = await this.pricingCollectionService.showByUserId(req.user.id)
      res.json({collections: collections})
    } catch (err: any) {
      res.status(500).send({error: err.message})
    }
  }

  // async show (req: any, res: any) {
  //   try {
  //     const pricing = await this.pricingCollectionService.show(req.user.id)
  //     res.json(pricing)
  //   } catch (err: any) {
  //     if (err.message.toLowerCase().includes('not found')) {
  //       res.status(404).send({error: err.message})
  //     }else{
  //       res.status(500).send({error: err.message})
  //     }
  //   }
  // }

  // async create (req: any, res: any) {
  //   try {
  //     const pricing = await this.pricingService.create(req.file, req.user.email.split('@')[0])
  //     res.json(pricing)
  //   } catch (err: any) {
  //     try{
  //       const file = req.file;
  //       const directory = path.dirname(file.path);
  //       if (fs.readdirSync(directory).length === 1) {
  //         fs.rmdirSync(directory, { recursive: true });
  //       }else{
  //         fs.rmSync(file.path);
  //       }
  //       res.status(500).send({error: err.message})
  //     }catch(err){
  //       res.status(500).send({error: (err as Error).message})
  //     }
  //   }
  // }

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

export default PricingCollectionController
