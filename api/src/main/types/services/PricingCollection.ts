export type CollectionIndexQueryParams = {
  name?: string;
  sortBy?: string;
  sort?: string;
  organizationIds?: string[];
  limit?: string;
  offset?: string;
  _organizationId?: string;
  [key: string]: any;
}