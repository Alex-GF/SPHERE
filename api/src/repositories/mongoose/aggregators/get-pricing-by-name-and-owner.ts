export function getPricingByNameAndOwnerAggregator(
  pricingName: string,
  owner: string
) {
  return [
    {
      $match: {
        name: { $regex: `^${pricingName}$`, $options: 'i' },
        owner: { $regex: `^${owner}$`, $options: 'i' },
      },
    },
    {
      $lookup: {
        from: 'pricingCollections',
        localField: '_collectionId',
        foreignField: '_id',
        as: 'collection',
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: 'username',
        as: 'owner',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$collection', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { name: '$name', owner: '$owner.username' },
        name: { $first: '$name' },
        versions: {
          $push: {
            id: { $toString: '$_id' },
            version: '$version',
            private: '$private',
            _collectionId: '$_collectionId',
            collection: { $ifNull: ['$collection.name', null] },
            extractionDate: '$extractionDate',
            url: '$url',
            yaml: '$yaml',
            analytics: '$analytics',
            owner: {
              id: { $toString: '$owner._id' },
              username: '$owner.username',
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: 1, // `name` global
        owner: 1, // `owner` global
        versions: { $sortArray: { input: '$versions', sortBy: { extractionDate: -1 } } }, // Orden descendente por fecha
      },
    },
  ];
}