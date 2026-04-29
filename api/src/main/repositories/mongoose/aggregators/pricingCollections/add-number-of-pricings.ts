import { getAllPricingsFromCollection } from '../get-pricings-from-collection';

export function addNumberOfPricingsAggregator() {
  return [
    ...getAllPricingsFromCollection(),
    {
      $addFields: {
        numberOfPricings: { $size: '$data.pricings' },
      },
    },
  ];
}
