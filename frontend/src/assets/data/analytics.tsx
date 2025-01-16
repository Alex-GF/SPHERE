export interface SaaSAnalytics {
  numberOfFeatures: number;
  numberOfInformationFeatures: number;
  numberOfIntegrationFeatures: number;
  numberOfIntegrationApiFeatures: number;
  numberOfIntegrationExtensionFeatures: number;
  numberOfIntegrationIdentityProviderFeatures: number;
  numberOfIntegrationWebSaaSFeatures: number;
  numberOfIntegrationMarketplaceFeatures: number;
  numberOfIntegrationExternalDeviceFeatures: number;
  numberOfDomainFeatures: number;
  numberOfAutomationFeatures: number;
  numberOfBotAutomationFeatures: number;
  numberOfFilteringAutomationFeatures: number;
  numberOfTrackingAutomationFeatures: number;
  numberOfTaskAutomationFeatures: number;
  numberOfManagementFeatures: number;
  numberOfGuaranteeFeatures: number;
  numberOfSupportFeatures: number;
  numberOfPaymentFeatures: number;
  numberOfUsageLimits: number;
  numberOfRenewableUsageLimits: number;
  numberOfNonRenewableUsageLimits: number;
  numberOfResponseDrivenUsageLimits: number;
  numberOfTimeDrivenUsageLimits: number;
  numberOfPlans: number;
  numberOfFreePlans: number;
  numberOfPaidPlans: number;
  numberOfAddOns: number;
  numberOfReplacementAddons: number;
  numberOfExtensionAddons: number;
  configurationSpaceSize: number;
  minSubscriptionPrice: number;
  maxSubscriptionPrice: number;
}

export interface AnalyticsDataEntry {
  name: string;
  owner: string;
  version: string;
  extractionDate: string;
  currency: string;
  yaml: string;
  analytics: SaaSAnalytics;
}

export interface AnalyticsData {
  [key: string]: AnalyticsDataEntry[];
}