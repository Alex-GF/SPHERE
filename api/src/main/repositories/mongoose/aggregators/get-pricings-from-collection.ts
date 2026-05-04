import { getAllPricingsAggregator } from './get-all-pricings';

export function getAllPricingsFromCollection() {
  return [
    lookupForPricingsAggregator,
    {
      $set: {
        data: {
          $arrayElemAt: ['$pricings', 0],
        },
      },
    },
    {
      $unset: 'pricings',
    },
  ];
}

const lookupForPricingsAggregator = {
  $lookup: {
    from: 'pricings',
    let: { localId: { $toString: '$_id' } },
    pipeline: [
      {
        $match: {
          $expr: {
            $eq: ['$_collectionId', '$$localId'],
          },
        },
      },

      ...getAllPricingsAggregator([], []),
    ],
    as: 'pricings',
  },
};
