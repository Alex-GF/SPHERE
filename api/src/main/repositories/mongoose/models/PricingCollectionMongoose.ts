import mongoose, { Schema } from 'mongoose';

const ParameterEvolutionSchema = new Schema(
  {
    dates: { type: [Date], default: [] },
    values: { type: [Number], default: [] },
  },
  { _id: false } // No necesitamos un _id para este subdocumento
);

const pricingCollectionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    _ownerName: { type: String, ref: 'User', required: true },
    private: { type: Boolean, required: true, default: false },
    analytics: {
      evolutionOfPlans: { type: ParameterEvolutionSchema, required: false },
      evolutionOfAddOns: { type: ParameterEvolutionSchema, required: false },
      evolutionOfFeatures: { type: ParameterEvolutionSchema, required: false },
      evolutionOfConfigurationSpaceSize: { type: ParameterEvolutionSchema, required: false },
    },
  },
  {
    toObject: {
      virtuals: true,
      transform: function (doc, resultObject, options) {
        delete (resultObject as any)._id;
        delete (resultObject as any).__v;
        delete (resultObject as any)._ownerName;
        delete (resultObject as any).owner._id;
        return resultObject;
      },
    },
  }
);

pricingCollectionSchema.virtual('owner', {
  ref: 'User',
  localField: '_ownerName',
  foreignField: 'username',
  justOne: true,
});

// Adding unique index for [name, owner, version]
pricingCollectionSchema.index({ name: 1, _ownerName: 1 }, { unique: true });

const pricingCollectionModel = mongoose.model(
  'PricingCollection',
  pricingCollectionSchema,
  'pricingCollections'
);

export default pricingCollectionModel;
