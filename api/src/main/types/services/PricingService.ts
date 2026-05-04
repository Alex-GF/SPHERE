export type PricingIndexQueryParams = {
  name?: string;
  sortBy?: SortByType;
  sort?: 'asc' | 'desc';
  includePrivate?: boolean;
  subscriptions?: {
    min: number;
    max: number;
  };
  minPrice?: {
    min: number;
    max: number;
  };
  maxPrice?: {
    min: number;
    max: number;
  };
  selectedOwners?: string[];
  collectionName?: string;
  organizationId?: string;
  includePricingsInCollection: boolean;
  limit: number;
  offset: number;
}

export type SortByType = 'name' | 'configurationSpaceSize' | 'featuresCount' | 'usageLimitsCount' | 'plansCount' | 'addonsCount' | 'minPrice' | 'maxPrice' | ''
