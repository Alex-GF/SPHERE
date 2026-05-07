export interface CollectionEntry {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
    displayName: string;
    avatar: string;
  };
  numberOfPricings: number;
}

export interface PricingEntry {
  name: string,
  version: string;
  createdAt: string;
  currency: string;
  organization: {
    id: string;
    name: string;
    displayName: string;
    avatar: string;
    isPersonal: boolean;
  };
  collectionName: string
}

export interface CollectionToCreate {
  name: string;
  description: string;
  private: boolean;
  pricings: string[];
}