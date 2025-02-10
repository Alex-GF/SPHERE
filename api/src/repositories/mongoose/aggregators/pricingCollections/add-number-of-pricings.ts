import { getAllPricingsFromCollection } from '../get-pricings-from-collection';

export function addNumberOfPricingsAggregator() {
  return [
    ...getAllPricingsFromCollection(),
    {
      $addFields: {
        pricings: {
          $arrayElemAt: ['$pricings', 0],
        },
      },
    },
    {
      $unwind: {
        path: '$pricings',
      },
    },
    {
      $addFields: {
        numberOfPricings: { $size: '$pricings.pricings' },
      },
    },
  ];
}
