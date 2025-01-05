import { PricingAnalytics } from "./PricingAnalytics";

export interface Pricing {
  id: string;
  name: string;
  extractionDate: Date;
  url?: string;
  yaml: string;
  analytics?: PricingAnalytics;
}