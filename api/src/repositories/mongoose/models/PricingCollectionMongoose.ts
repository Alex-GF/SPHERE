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
    _ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    private: { type: Boolean, required: true, default: false },
    analytics: {
      evolutionOfPlans: { type: ParameterEvolutionSchema, required: false },
      evolutionOfAddOns: { type: ParameterEvolutionSchema, required: false },
      evolutionOfFeatures: { type: ParameterEvolutionSchema, required: false },
      evolutionOfConfigurationSpaceSize: { type: ParameterEvolutionSchema, required: false },
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
