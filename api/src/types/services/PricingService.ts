export type PricingIndexQueryParams = Record<string, string | string[] | {min: number, max: number} | undefined>

// Pagination params for price listing
export type PaginationParams = {
	limit?: string | number;
	offset?: string | number;
}

export type SortByType = 'configurationSpaceSize' | 'featuresCount' | 'usageLimitsCount' | 'plansCount' | 'addonsCount' | 'minPrice' | 'maxPrice' | ''