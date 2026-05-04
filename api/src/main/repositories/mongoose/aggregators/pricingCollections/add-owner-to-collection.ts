export function addOwnerToCollectionAggregator() {
  return [
    {
      $lookup: {
        from: 'users',
        localField: '_ownerName',
        foreignField: 'username',
        as: 'owner',
      },
    },
    {
      $unwind: {
        path: '$owner',
      },
    }
  ];
}