import { getAllPricingsAggregator } from "./get-all-pricings";

export function getAllPricingsFromCollection() {
  return [lookupForPricingsAggregator];
}

const lookupForPricingsAggregator = {
  $lookup: {
    from: 'pricings',
    localField: '_id',
    foreignField: '_collectionId',
    as: 'pricings',
    pipeline: getAllPricingsAggregator([], []),
  },
};
