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
    { $unwind: { path: '$collection', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { name: '$name', owner: '$owner.username', collectionName: "$collection.name" },
        name: { $first: '$name' },
        collectionName: { $first: '$collection.name' },
        versions: {
          $push: {
            id: { $toString: '$_id' },
            version: '$version',
            private: '$private',
            collectionName: { $ifNull: ['$collection.name', null] },
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
        collectionName: 1,
        versions: { $sortArray: { input: '$versions', sortBy: { extractionDate: -1 } } }, // Orden descendente por fecha
      },
    },
  ];
}