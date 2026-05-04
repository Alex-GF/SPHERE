export interface TestPricing {
  id?: string;
  version: string;
  currency: string;
  createdAt: string;
  features: Record<string, TestFeature>;
  usageLimits?: Record<string, TestUsageLimit>;
  plans?: Record<string, TestPlan>;
  addOns?: Record<string, TestAddOn>;
}


// ----------------------------------------
// -------------- Main Types --------------
// ----------------------------------------

export interface TestFeature {
  name: string;
  description?: string;
  valueType: "BOOLEAN" | "TEXT" | "NUMERIC";
  defaultValue: string | boolean;
  value?: string | boolean | undefined;
  type: "INFORMATION" | "INTEGRATION" | "DOMAIN" | "AUTOMATION" | "MANAGEMENT" | "GUARANTEE" | "SUPPORT" | "PAYMENT";
  integrationType?: "API" | "EXTENSION" | "IDENTITY_PROVIDER" | "WEB_SAAS" | "MARKETPLACE" | "EXTERNAL_DEVICE";
  pricingUrls?: string[];
  automationType?: "BOT" | "FILTERING" | "TRACKING" | "TASK_AUTOMATION";
  paymentType?: "CARD" | "GATEWAY" | "INVOICE" | "ACH" | "WIRE_TRANSFER" | "OTHER";
  docUrl?: string;
  expression?: string;
  serverExpression?: string;
  render: "auto" | "enabled" | "disabled";
  tag?: string;
}

export interface TestUsageLimit {
  name: string;
  description?: string;
  valueType: "BOOLEAN" | "NUMERIC";
  defaultValue: number | boolean;
  value?: number | boolean | undefined;
  type: "RENEWABLE" | "NON_RENEWABLE";
  trackable?: boolean;
  period?: TestPeriod;
  linkedFeatures?: string[];
}

export interface TestPlan {
  description?: string;
  price: string | number;
  private?: boolean;
  features: Record<string, string | boolean>;
  usageLimits?: Record<string, number | boolean>;
}

export interface TestAddOn {
  description?: string;
  private?: boolean;
  price: string | number;
  availableFor?: string[];
  dependsOn?: string[];
  excludes?: string[];
  features?: Record<string, { value: string | boolean}>;
  usageLimits?: Record<string, { value: number | boolean}>;
  usageLimitsExtensions?: Record<string, { value: number}>;
  subscriptionConstraints?: TestSubscriptionConstraint;
}


// ----------------------------------------
// ------------- Auxiliar Types -----------
// ----------------------------------------

export interface TestPeriod {
  value: number;
  unit: "SEC" | "MIN" | "HOUR" | "DAY" | "MONTH" | "YEAR";
}

export interface TestSubscriptionConstraint {
  minQuantity?: number;
  maxQuantity?: number;
  quantityStep?: number;
}
