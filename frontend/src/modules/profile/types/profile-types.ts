export interface CollectionEntry {
  id: string,
  name: string,
  owner: {
    id: string
    username: string,
    avatar: string,
  },
  numberOfPricings: number
}

export interface PricingEntry {
  
}