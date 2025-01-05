import mongoose, { Schema } from 'mongoose';

const pricingSchema = new Schema(
  {
    name: { type: String, required: true },
    extractionDate: { type: Date, required: true },
    url: { type: String, required: true },
    yaml: { type: String, required: true },
    analytics: {
      numberOfFeatures: { type: Number, required: true },
      numberOfInformationFeatures: { type: Number, required: true },
      numberOfIntegrationFeatures: { type: Number, required: true },
      numberOfIntegrationApiFeatures: { type: Number, required: true },
      numberOfIntegrationExtensionFeatures: { type: Number, required: true },
      numberOfIntegrationIdentityProviderFeatures: { type: Number, required: true },
      numberOfIntegrationWebSaaSFeatures: { type: Number, required: true },
      numberOfIntegrationMarketplaceFeatures: { type: Number, required: true },
      numberOfIntegrationExternalDeviceFeatures: { type: Number, required: true },
      numberOfDomainFeatures: { type: Number, required: true },
      numberOfAutomationFeatures: { type: Number, required: true },
      numberOfBotAutomationFeatures: { type: Number, required: true },
      numberOfFilteringAutomationFeatures: { type: Number, required: true },
      numberOfTrackingAutomationFeatures: { type: Number, required: true },
      numberOfTaskAutomationFeatures: { type: Number, required: true },
      numberOfManagementFeatures: { type: Number, required: true },
      numberOfGuaranteeFeatures: { type: Number, required: true },
      numberOfSupportFeatures: { type: Number, required: true },
      numberOfPaymentFeatures: { type: Number, required: true },
      numberOfUsageLimits: { type: Number, required: true },
      numberOfRenewableUsageLimits: { type: Number, required: true },
      numberOfNonRenewableUsageLimits: { type: Number, required: true },
      numberOfResponseDrivenUsageLimits: { type: Number, required: true },
      numberOfTimeDrivenUsageLimits: { type: Number, required: true },
      numberOfPlans: { type: Number, required: true },
      numberOfFreePlans: { type: Number, required: true },
      numberOfPaidPlans: { type: Number, required: true },
      numberOfAddOns: { type: Number, required: true },
      numberOfReplacementAddons: { type: Number, required: true },
      numberOfExtensionAddons: { type: Number, required: true },
      configurationSpaceSize: { type: Number, required: true },
      minSubscriptionPrice: { type: Number, required: true },
      maxSubscriptionPrice: { type: Number, required: true }
    }
  });

pricingSchema.virtual('pricingAnalytics', {
  ref: 'PricingAnalytics',
  localField: '_pricingAnalyticsId',
  foreignField: '_id',
});

const pricingModel = mongoose.model('Pricing', pricingSchema, 'pricings')

export default pricingModel;
