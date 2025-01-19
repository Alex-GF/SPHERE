import mongoose, { Schema } from 'mongoose';

const pricingSchema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    version: { type: String, required: true },
    extractionDate: { type: Date, required: true },
    url: { type: String, required: false },
    currency: { type: String, required: true },
    yaml: { type: String, required: true },
    analytics: {
      numberOfFeatures: { type: Number, required: false },
      numberOfInformationFeatures: { type: Number, required: false },
      numberOfIntegrationFeatures: { type: Number, required: false },
      numberOfIntegrationApiFeatures: { type: Number, required: false },
      numberOfIntegrationExtensionFeatures: { type: Number, required: false },
      numberOfIntegrationIdentityProviderFeatures: { type: Number, required: false },
      numberOfIntegrationWebSaaSFeatures: { type: Number, required: false },
      numberOfIntegrationMarketplaceFeatures: { type: Number, required: false },
      numberOfIntegrationExternalDeviceFeatures: { type: Number, required: false },
      numberOfDomainFeatures: { type: Number, required: false },
      numberOfAutomationFeatures: { type: Number, required: false },
      numberOfBotAutomationFeatures: { type: Number, required: false },
      numberOfFilteringAutomationFeatures: { type: Number, required: false },
      numberOfTrackingAutomationFeatures: { type: Number, required: false },
      numberOfTaskAutomationFeatures: { type: Number, required: false },
      numberOfManagementFeatures: { type: Number, required: false },
      numberOfGuaranteeFeatures: { type: Number, required: false },
      numberOfSupportFeatures: { type: Number, required: false },
      numberOfPaymentFeatures: { type: Number, required: false },
      numberOfUsageLimits: { type: Number, required: false },
      numberOfRenewableUsageLimits: { type: Number, required: false },
      numberOfNonRenewableUsageLimits: { type: Number, required: false },
      numberOfResponseDrivenUsageLimits: { type: Number, required: false },
      numberOfTimeDrivenUsageLimits: { type: Number, required: false },
      numberOfPlans: { type: Number, required: false },
      numberOfFreePlans: { type: Number, required: false },
      numberOfPaidPlans: { type: Number, required: false },
      numberOfAddOns: { type: Number, required: false },
      numberOfReplacementAddons: { type: Number, required: false },
      numberOfExtensionAddons: { type: Number, required: false },
      configurationSpaceSize: { type: Number, required: false },
      minSubscriptionPrice: { type: Number, required: false },
      maxSubscriptionPrice: { type: Number, required: false }
    }
  }, {
    toJSON: {
      virtuals: true,
      transform: function (doc, resultObject, options) {
        delete resultObject._id
        delete resultObject.__v
        return resultObject
      }
    }
  });

// Adding unique index for [name, owner, version]
pricingSchema.index({ name: 1, owner: 1, version: 1 }, { unique: true });

const pricingModel = mongoose.model('Pricing', pricingSchema, 'pricings');

export default pricingModel;
