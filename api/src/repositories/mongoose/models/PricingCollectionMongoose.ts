import mongoose, { Schema, SchemaType } from 'mongoose';

class ParameterEvolution extends SchemaType {
  constructor(key: string, options: object) {
    super(key, options, 'ParameterEvolution');
  }

  cast(val: any) {
    if (!('dates' in val)) {
      throw new Error('ParameterEvolution must have a "dates" property');
    }

    if (!('values' in val)) {
      throw new Error('ParameterEvolution must have a "values" property');
    }

    if (!Array.isArray(val.dates)) {
      throw new Error('ParameterEvolution "dates" must be an array');
    }

    if (!Array.isArray(val.values)) {
      throw new Error('ParameterEvolution "values" must be an array');
    }

    if (Array.isArray(val.dates) && Array.isArray(val.values)) {
      if (val.dates.length !== val.values.length) {
        throw new Error('ParameterEvolution "dates" and "values" must have the same length');
      }
    }

    const _val: { dates: Date[]; values: number[] } = { dates: val.dates, values: val.values };

    return _val;
  }
}

(mongoose.Schema.Types as any).ParameterEvolution = ParameterEvolution;

const pricingCollectionSchema = new Schema(
  {
    name: { type: String, required: true },
    _ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    analytics: {
      evolutionOfPlans: { type: ParameterEvolution, required: false },
      evolutionOfAddOns: { type: ParameterEvolution, required: false },
      evolutionOfFeatures: { type: ParameterEvolution, required: false },
      evolutionOfConfigurationSpaceSize: { type: ParameterEvolution, required: false },
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, resultObject, options) {
        delete resultObject._id;
        delete resultObject.__v;
        delete resultObject._ownerId;
        return resultObject;
      },
    },
  }
);

pricingCollectionSchema.virtual('owner', {
  ref: 'User',
  localField: '_ownerId',
  foreignField: '_id',
  justOne: true,
});

// Adding unique index for [name, owner, version]
pricingCollectionSchema.index({ name: 1, _ownerId: 1 }, { unique: true });

const pricingCollectionModel = mongoose.model(
  'PricingCollection',
  pricingCollectionSchema,
  'pricingCollections'
);

export default pricingCollectionModel;
