export function addOwnerToCollectionAggregator() {
  return [
    {
      $lookup: {
        from: 'users',
        localField: '_ownerId',
        foreignField: '_id',
        as: 'owner',
      },
    },
    {
      $unwind: {
        path: '$owner',
      },
    }
  ]
}