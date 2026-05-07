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
    _organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
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
      transform: function (doc, resultObject) {
        delete (resultObject as any)._id;
        delete (resultObject as any).__v;
        delete (resultObject as any)._organizationId;
        delete (resultObject as any).organization?._id;
        return resultObject;
      },
    },
  }
);

pricingCollectionSchema.virtual('organization', {
  ref: 'Organization',
  localField: '_organizationId',
  foreignField: '_id',
  justOne: true,
});

// Adding unique index for [name, _organizationId]
pricingCollectionSchema.index({ name: 1, _organizationId: 1 }, { unique: true });

const pricingCollectionModel = mongoose.model(
  'PricingCollection',
  pricingCollectionSchema,
  'pricingCollections'
);

export default pricingCollectionModel;
