export function getPricingByNameOwnerAndVersionAggregator(
  pricingName: string,
  owner: string,
  version?: string
) {
  return [
    {
      $match: {
        $expr: {
          $and: [
            { $eq: [{ $toLower: '$name' }, { $toLower: pricingName }] },
            { $eq: [{ $toLower: '$owner' }, { $toLower: owner }] },
            {
              $or: [
                { $eq: [version, null] },
                {
                  $eq: [{ $toLower: '$version' }, { $toLower: version! }],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: 'pricingCollections',
        let: {
          localCollectionId: {
            $convert: {
              input: '$_collectionId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$localCollectionId'],
              },
            },
          },
          {
            $project: {
              name: 1,
            },
          },
        ],
        as: 'collection',
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
        _id: { name: '$name', owner: '$owner.username', collectionName: '$collection.name' },
        name: { $first: '$name' },
        collectionName: { $first: '$collection.name' },
        versions: {
          $push: {
            id: { $toString: '$_id' },
            _collectionId: {
              $cond: [
                { $ifNull: ['$_collectionId', false] },
                { $toString: '$_collectionId' },
                null,
              ],
            },
            version: '$version',
            private: '$private',
            collectionName: { $ifNull: ['$collection.name', null] },
            createdAt: '$createdAt',
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
        versions: { $sortArray: { input: '$versions', sortBy: { createdAt: -1 } } }, // Orden descendente por fecha
      },
    },
  ];
}
