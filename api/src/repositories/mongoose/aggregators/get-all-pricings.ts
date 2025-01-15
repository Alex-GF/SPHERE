export function getAllPricingsAggregator(filteringAggregators: any) {
  return [
    latestPricingsByNameAggregator,
    refactorRootAggregator,
    ...filteringAggregators,
    computeFiltersDataAggregator,
    refactorOutputAggregator,
  ];
}

const latestPricingsByNameAggregator = {
  $group: {
    _id: '$name',
    latestPricing: {
      $first: '$$ROOT',
    },
    latestExtractionDate: {
      $max: '$extractionDate',
    },
  },
};

const refactorRootAggregator = {
  $replaceRoot: {
    newRoot: '$latestPricing',
  },
};

const refactorOutputAggregator = {
  $project: {
    pricings: '$pricings',
    minPrice: {
      $arrayElemAt: ['$minPrice', 0],
    },
    maxPrice: {
      $arrayElemAt: ['$maxPrice', 0],
    },
    configurationSpaceSize: {
      $arrayElemAt: ['$configurationSpaceSize', 0],
    },
  },
};

const computeFiltersDataAggregator = {
  $facet: {
    pricings: [
      {
        $project: {
          _id: 0,
          name: 1,
          owner: 1,
          version: 1,
          extractionDate: 1,
          currency: 1,
          analytics: {
            configurationSpaceSize: 1,
            minSubscriptionPrice: 1,
            maxSubscriptionPrice: 1,
          },
        },
      },
    ],
    minPrice: [
      {
        $group: {
          _id: null,
          min: {
            $min: '$analytics.minSubscriptionPrice',
          },
          max: {
            $max: '$analytics.minSubscriptionPrice',
          },
          data: {
            $push: '$analytics.minSubscriptionPrice',
          },
        },
      },
      {
        $set: {
          data: {
            $sortArray: {
              input: '$data',
              sortBy: 1,
            },
          },
        },
      },
      {
        $set: {
          percentileIndex: {
            $floor: {
              $multiply: [
                {
                  $size: '$data',
                },
                0.8,
              ],
            },
          },
        },
      },
      {
        $set: {
          percentile90: {
            $arrayElemAt: ['$data', '$percentileIndex'],
          },
        },
      },
      {
        $addFields: {
          data: {
            $map: {
              input: {
                $range: [0, 9],
              },
              as: 'index',
              in: {
                value: {
                  $concat: [
                    {
                      $toString: {
                        $round: [
                          {
                            $multiply: [
                              '$$index',
                              {
                                $divide: ['$percentile90', 9],
                              },
                            ],
                          },
                          2,
                        ],
                      },
                    },
                    '-',
                    {
                      $toString: {
                        $round: [
                          {
                            $multiply: [
                              {
                                $add: ['$$index', 1],
                              },
                              {
                                $divide: ['$percentile90', 9],
                              },
                            ],
                          },
                          2,
                        ],
                      },
                    },
                  ],
                },
                count: {
                  $size: {
                    $filter: {
                      input: '$data',
                      as: 'price',
                      cond: {
                        $and: [
                          {
                            $gte: [
                              '$$price',
                              {
                                $multiply: [
                                  '$$index',
                                  {
                                    $divide: ['$percentile90', 9],
                                  },
                                ],
                              },
                            ],
                          },
                          {
                            $lt: [
                              '$$price',
                              {
                                $multiply: [
                                  {
                                    $add: ['$$index', 1],
                                  },
                                  {
                                    $divide: ['$percentile90', 9],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          outlierRange: {
            value: {
              $concat: [
                {
                  $toString: {
                    $round: ['$percentile90', 2],
                  },
                },
                '+',
              ],
            },
            count: {
              $size: {
                $filter: {
                  input: '$data',
                  as: 'price',
                  cond: {
                    $gt: ['$$price', '$percentile90'],
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          data: {
            $concatArrays: ['$data', ['$outlierRange']],
          },
        },
      },
      {
        $project: {
          _id: 0,
          percentiles: 0,
          outlierRange: 0,
          percentile90: 0,
        },
      },
    ],
    maxPrice: [
      {
        $group: {
          _id: null,
          min: {
            $min: '$analytics.maxSubscriptionPrice',
          },
          max: {
            $max: '$analytics.maxSubscriptionPrice',
          },
          data: {
            $push: '$analytics.maxSubscriptionPrice',
          },
        },
      },
      {
        $set: {
          data: {
            $sortArray: {
              input: '$data',
              sortBy: 1,
            },
          },
        },
      },
      {
        $set: {
          percentileIndex: {
            $floor: {
              $multiply: [
                {
                  $size: '$data',
                },
                0.8,
              ],
            },
          },
        },
      },
      {
        $set: {
          percentile90: {
            $arrayElemAt: ['$data', '$percentileIndex'],
          },
        },
      },
      {
        $addFields: {
          data: {
            $map: {
              input: {
                $range: [0, 9],
              },
              as: 'index',
              in: {
                value: {
                  $concat: [
                    {
                      $toString: {
                        $round: [
                          {
                            $multiply: [
                              '$$index',
                              {
                                $divide: ['$percentile90', 9],
                              },
                            ],
                          },
                          2,
                        ],
                      },
                    },
                    '-',
                    {
                      $toString: {
                        $round: [
                          {
                            $multiply: [
                              {
                                $add: ['$$index', 1],
                              },
                              {
                                $divide: ['$percentile90', 9],
                              },
                            ],
                          },
                          2,
                        ],
                      },
                    },
                  ],
                },
                count: {
                  $size: {
                    $filter: {
                      input: '$data',
                      as: 'price',
                      cond: {
                        $and: [
                          {
                            $gte: [
                              '$$price',
                              {
                                $multiply: [
                                  '$$index',
                                  {
                                    $divide: ['$percentile90', 9],
                                  },
                                ],
                              },
                            ],
                          },
                          {
                            $lt: [
                              '$$price',
                              {
                                $multiply: [
                                  {
                                    $add: ['$$index', 1],
                                  },
                                  {
                                    $divide: ['$percentile90', 9],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          outlierRange: {
            value: {
              $concat: [
                {
                  $toString: {
                    $round: ['$percentile90', 2],
                  },
                },
                '+',
              ],
            },
            count: {
              $size: {
                $filter: {
                  input: '$data',
                  as: 'price',
                  cond: {
                    $gt: ['$$price', '$percentile90'],
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          data: {
            $concatArrays: ['$data', ['$outlierRange']],
          },
        },
      },
      {
        $project: {
          _id: 0,
          percentiles: 0,
          outlierRange: 0,
          percentile90: 0,
        },
      },
    ],
    configurationSpaceSize: [
      {
        $group: {
          _id: null,
          min: {
            $min: '$analytics.configurationSpaceSize',
          },
          max: {
            $max: '$analytics.configurationSpaceSize',
          },
          data: {
            $push: '$analytics.configurationSpaceSize',
          },
        },
      },
      {
        $set: {
          data: {
            $sortArray: {
              input: '$data',
              sortBy: 1,
            },
          },
        },
      },
      {
        $set: {
          percentileIndex: {
            $floor: {
              $multiply: [
                {
                  $size: '$data',
                },
                0.8,
              ],
            },
          },
        },
      },
      {
        $set: {
          percentile90: {
            $arrayElemAt: ['$data', '$percentileIndex'],
          },
        },
      },
      {
        $addFields: {
          data: {
            $map: {
              input: {
                $range: [0, 9],
              },
              as: 'index',
              in: {
                value: {
                  $concat: [
                    {
                      $toString: {
                        $trunc: {
                          $multiply: [
                            '$$index',
                            {
                              $divide: ['$percentile90', 9],
                            },
                          ],
                        },
                      },
                    },
                    '-',
                    {
                      $toString: {
                        $trunc: {
                          $multiply: [
                            {
                              $add: ['$$index', 1],
                            },
                            {
                              $divide: ['$percentile90', 9],
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
                count: {
                  $size: {
                    $filter: {
                      input: '$data',
                      as: 'size',
                      cond: {
                        $and: [
                          {
                            $gte: [
                              '$$size',
                              {
                                $multiply: [
                                  '$$index',
                                  {
                                    $divide: ['$percentile90', 9],
                                  },
                                ],
                              },
                            ],
                          },
                          {
                            $lt: [
                              '$$size',
                              {
                                $multiply: [
                                  {
                                    $add: ['$$index', 1],
                                  },
                                  {
                                    $divide: ['$percentile90', 9],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          outlierRange: {
            value: {
              $concat: [
                {
                  $toString: {
                    $trunc: ['$percentile90'],
                  },
                },
                '+',
              ],
            },
            count: {
              $size: {
                $filter: {
                  input: '$data',
                  as: 'size',
                  cond: {
                    $gt: ['$$size', '$percentile90'],
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          data: {
            $concatArrays: ['$data', ['$outlierRange']],
          },
        },
      },
      {
        $project: {
          _id: 0,
          percentiles: 0,
          outlierRange: 0,
          percentile90: 0,
        },
      },
    ],
  },
};
