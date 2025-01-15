export type PricingIndexQueryParams = Record<string, string | string[] | {min: number, max: number} | undefined>

export type SortByType = 'configurationSpaceSize' | 'featuresCount' | 'usageLimitsCount' | 'plansCount' | 'addonsCount' | 'minPrice' | 'maxPrice' | ''