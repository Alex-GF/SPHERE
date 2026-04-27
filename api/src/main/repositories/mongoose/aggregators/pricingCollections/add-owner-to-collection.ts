export function addOwnerToCollectionAggregator() {
  return [
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
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