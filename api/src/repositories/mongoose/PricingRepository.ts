import RepositoryBase from '../RepositoryBase';
import PricingMongoose from './models/PricingMongoose';
import PricingAnalyticsMongoose from './models/PricingAnalyticsMongoose';

class PricingRepository extends RepositoryBase {

  async findAll (...args: any) {
    try {
      const pricings = await PricingMongoose.find();
      return pricings.map(pricing => pricing.toObject({ getters: true, virtuals: true, versionKey: false }));
    } catch (err) {
      return [];
    }
  }

  async findById(id: string, ...args: any) {
    try {
      const pricing = await PricingMongoose.findById(id, { password: 0 });
      return pricing!.toObject({ getters: true, virtuals: true, versionKey: false });
    } catch (err) {
      return null;
    }
  }

  async destroy(id: string, ...args: any) {
    const result = await PricingMongoose.deleteOne({ _id: id });
    return result?.deletedCount === 1;
  }
}

export default PricingRepository;
