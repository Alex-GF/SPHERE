export function addOrganizationToCollectionAggregator() {
  return [
    {
      $lookup: {
        from: 'organizations',
        localField: '_organizationId',
        foreignField: '_id',
        as: 'organization',
      },
    },
    {
      $unwind: {
        path: '$organization',
      },
    }
  ];
}
