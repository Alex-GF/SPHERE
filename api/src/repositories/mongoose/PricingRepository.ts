import RepositoryBase from '../RepositoryBase';
import PricingMongoose from './models/PricingMongoose';
import { PricingAnalytics } from '../../types/database/Pricing';

class PricingRepository extends RepositoryBase {
  async findAll(...args: any) {
    try {
      const pricings = await PricingMongoose.aggregate([
        {
          '$group': {
            '_id': '$name', 
            'latestPricing': {
              '$first': '$$ROOT'
            }, 
            'latestExtractionDate': {
              '$max': '$extractionDate'
            }
          }
        }, {
          '$replaceRoot': {
            'newRoot': '$latestPricing'
          }
        }, {
          '$facet': {
            'pricings': [
              {
                '$project': {
                  '_id': 0, 
                  'name': 1, 
                  'version': 1, 
                  'analytics': 1
                }
              }
            ], 
            'minPrice': [
              {
                '$group': {
                  '_id': null, 
                  'min': {
                    '$min': '$analytics.minSubscriptionPrice'
                  }, 
                  'max': {
                    '$max': '$analytics.minSubscriptionPrice'
                  }, 
                  'data': {
                    '$push': '$analytics.minSubscriptionPrice'
                  }
                }
              }, {
                '$set': {
                  'data': {
                    '$sortArray': {
                      'input': '$data', 
                      'sortBy': 1
                    }
                  }
                }
              }, {
                '$set': {
                  'percentileIndex': {
                    '$floor': {
                      '$multiply': [
                        {
                          '$size': '$data'
                        }, 0.8
                      ]
                    }
                  }
                }
              }, {
                '$set': {
                  'percentile90': {
                    '$arrayElemAt': [
                      '$data', '$percentileIndex'
                    ]
                  }
                }
              }, {
                '$addFields': {
                  'data': {
                    '$map': {
                      'input': {
                        '$range': [
                          0, 9
                        ]
                      }, 
                      'as': 'index', 
                      'in': {
                        'value': {
                          '$concat': [
                            {
                              '$toString': {
                                '$round': [
                                  {
                                    '$multiply': [
                                      '$$index', {
                                        '$divide': [
                                          '$percentile90', 9
                                        ]
                                      }
                                    ]
                                  }, 2
                                ]
                              }
                            }, '-', {
                              '$toString': {
                                '$round': [
                                  {
                                    '$multiply': [
                                      {
                                        '$add': [
                                          '$$index', 1
                                        ]
                                      }, {
                                        '$divide': [
                                          '$percentile90', 9
                                        ]
                                      }
                                    ]
                                  }, 2
                                ]
                              }
                            }
                          ]
                        }, 
                        'count': {
                          '$size': {
                            '$filter': {
                              'input': '$data', 
                              'as': 'price', 
                              'cond': {
                                '$and': [
                                  {
                                    '$gte': [
                                      '$$price', {
                                        '$multiply': [
                                          '$$index', {
                                            '$divide': [
                                              '$percentile90', 9
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  }, {
                                    '$lt': [
                                      '$$price', {
                                        '$multiply': [
                                          {
                                            '$add': [
                                              '$$index', 1
                                            ]
                                          }, {
                                            '$divide': [
                                              '$percentile90', 9
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  }, 
                  'outlierRange': {
                    'value': {
                      '$concat': [
                        {
                          '$toString': {
                            '$round': [
                              '$percentile90', 2
                            ]
                          }
                        }, '+'
                      ]
                    }, 
                    'count': {
                      '$size': {
                        '$filter': {
                          'input': '$data', 
                          'as': 'price', 
                          'cond': {
                            '$gt': [
                              '$$price', '$percentile90'
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }, {
                '$addFields': {
                  'data': {
                    '$concatArrays': [
                      '$data', [
                        '$outlierRange'
                      ]
                    ]
                  }
                }
              }, {
                '$project': {
                  '_id': 0, 
                  'percentiles': 0, 
                  'outlierRange': 0, 
                  'percentile90': 0
                }
              }
            ], 
            'maxPrice': [
              {
                '$group': {
                  '_id': null, 
                  'min': {
                    '$min': '$analytics.maxSubscriptionPrice'
                  }, 
                  'max': {
                    '$max': '$analytics.maxSubscriptionPrice'
                  }, 
                  'data': {
                    '$push': '$analytics.maxSubscriptionPrice'
                  }
                }
              }, {
                '$set': {
                  'data': {
                    '$sortArray': {
                      'input': '$data', 
                      'sortBy': 1
                    }
                  }
                }
              }, {
                '$set': {
                  'percentileIndex': {
                    '$floor': {
                      '$multiply': [
                        {
                          '$size': '$data'
                        }, 0.8
                      ]
                    }
                  }
                }
              }, {
                '$set': {
                  'percentile90': {
                    '$arrayElemAt': [
                      '$data', '$percentileIndex'
                    ]
                  }
                }
              }, {
                '$addFields': {
                  'data': {
                    '$map': {
                      'input': {
                        '$range': [
                          0, 9
                        ]
                      }, 
                      'as': 'index', 
                      'in': {
                        'value': {
                          '$concat': [
                            {
                              '$toString': {
                                '$round': [
                                  {
                                    '$multiply': [
                                      '$$index', {
                                        '$divide': [
                                          '$percentile90', 9
                                        ]
                                      }
                                    ]
                                  }, 2
                                ]
                              }
                            }, '-', {
                              '$toString': {
                                '$round': [
                                  {
                                    '$multiply': [
                                      {
                                        '$add': [
                                          '$$index', 1
                                        ]
                                      }, {
                                        '$divide': [
                                          '$percentile90', 9
                                        ]
                                      }
                                    ]
                                  }, 2
                                ]
                              }
                            }
                          ]
                        }, 
                        'count': {
                          '$size': {
                            '$filter': {
                              'input': '$data', 
                              'as': 'price', 
                              'cond': {
                                '$and': [
                                  {
                                    '$gte': [
                                      '$$price', {
                                        '$multiply': [
                                          '$$index', {
                                            '$divide': [
                                              '$percentile90', 9
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  }, {
                                    '$lt': [
                                      '$$price', {
                                        '$multiply': [
                                          {
                                            '$add': [
                                              '$$index', 1
                                            ]
                                          }, {
                                            '$divide': [
                                              '$percentile90', 9
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  }, 
                  'outlierRange': {
                    'value': {
                      '$concat': [
                        {
                          '$toString': {
                            '$round': [
                              '$percentile90', 2
                            ]
                          }
                        }, '+'
                      ]
                    }, 
                    'count': {
                      '$size': {
                        '$filter': {
                          'input': '$data', 
                          'as': 'price', 
                          'cond': {
                            '$gt': [
                              '$$price', '$percentile90'
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }, {
                '$addFields': {
                  'data': {
                    '$concatArrays': [
                      '$data', [
                        '$outlierRange'
                      ]
                    ]
                  }
                }
              }, {
                '$project': {
                  '_id': 0, 
                  'percentiles': 0, 
                  'outlierRange': 0, 
                  'percentile90': 0
                }
              }
            ], 
            'configurationSpaceSize': [
              {
                '$group': {
                  '_id': null, 
                  'min': {
                    '$min': '$analytics.configurationSpaceSize'
                  }, 
                  'max': {
                    '$max': '$analytics.configurationSpaceSize'
                  }, 
                  'data': {
                    '$push': '$analytics.configurationSpaceSize'
                  }
                }
              }, {
                '$set': {
                  'data': {
                    '$sortArray': {
                      'input': '$data', 
                      'sortBy': 1
                    }
                  }
                }
              }, {
                '$set': {
                  'percentileIndex': {
                    '$floor': {
                      '$multiply': [
                        {
                          '$size': '$data'
                        }, 0.8
                      ]
                    }
                  }
                }
              }, {
                '$set': {
                  'percentile90': {
                    '$arrayElemAt': [
                      '$data', '$percentileIndex'
                    ]
                  }
                }
              }, {
                '$addFields': {
                  'data': {
                    '$map': {
                      'input': {
                        '$range': [
                          0, 9
                        ]
                      }, 
                      'as': 'index', 
                      'in': {
                        'value': {
                          '$concat': [
                            {
                              '$toString': {
                                '$trunc': {
                                  '$multiply': [
                                    '$$index', {
                                      '$divide': [
                                        '$percentile90', 9
                                      ]
                                    }
                                  ]
                                }
                              }
                            }, '-', {
                              '$toString': {
                                '$trunc': {
                                  '$multiply': [
                                    {
                                      '$add': [
                                        '$$index', 1
                                      ]
                                    }, {
                                      '$divide': [
                                        '$percentile90', 9
                                      ]
                                    }
                                  ]
                                }
                              }
                            }
                          ]
                        }, 
                        'count': {
                          '$size': {
                            '$filter': {
                              'input': '$data', 
                              'as': 'size', 
                              'cond': {
                                '$and': [
                                  {
                                    '$gte': [
                                      '$$size', {
                                        '$multiply': [
                                          '$$index', {
                                            '$divide': [
                                              '$percentile90', 9
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  }, {
                                    '$lt': [
                                      '$$size', {
                                        '$multiply': [
                                          {
                                            '$add': [
                                              '$$index', 1
                                            ]
                                          }, {
                                            '$divide': [
                                              '$percentile90', 9
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  }, 
                  'outlierRange': {
                    'value': {
                      '$concat': [
                        {
                          '$toString': {
                            '$trunc': [
                              '$percentile90'
                            ]
                          }
                        }, '+'
                      ]
                    }, 
                    'count': {
                      '$size': {
                        '$filter': {
                          'input': '$data', 
                          'as': 'size', 
                          'cond': {
                            '$gt': [
                              '$$size', '$percentile90'
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }, {
                '$addFields': {
                  'data': {
                    '$concatArrays': [
                      '$data', [
                        '$outlierRange'
                      ]
                    ]
                  }
                }
              }, {
                '$project': {
                  '_id': 0, 
                  'percentiles': 0, 
                  'outlierRange': 0, 
                  'percentile90': 0
                }
              }
            ]
          }
        }, {
          '$project': {
            'pricings': '$pricings', 
            'minPrice': {
              '$arrayElemAt': [
                '$minPrice', 0
              ]
            }, 
            'maxPrice': {
              '$arrayElemAt': [
                '$maxPrice', 0
              ]
            }, 
            'configurationSpaceSize': {
              '$arrayElemAt': [
                '$configurationSpaceSize', 0
              ]
            }
          }
        }
      ]);
      return pricings[0];
    } catch (err) {
      return [];
    }
  }

  async findByName(name: string, ...args: any) {
    try {
      const pricing = await PricingMongoose.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $toLower: '$name' }, { $toLower: name }],
            },
          },
        },
        {
          $group: {
            _id: {
              name: '$name',
            },
            versions: {
              $push: {
                version: '$version',
                extractionDate: '$extractionDate',
                url: '$url',
                yaml: '$yaml',
                analytics: '$analytics',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id.name',
            versions: 1,
          },
        },
      ]);

      if (!pricing || pricing.length === 0) {
        return null;
      }

      return pricing[0];
    } catch (err) {
      return null;
    }
  }

  async create(data: any, ...args: any) {
    const pricing = new PricingMongoose(data);
    await pricing.save();

    return pricing.toJSON();
  }

  async updateAnalytics(pricingId: string, analytics: PricingAnalytics, ...args: any) {
    const pricing = await PricingMongoose.findOne({ _id: pricingId });
    if (!pricing) {
      return null;
    }

    pricing.set({ analytics: analytics });
    await pricing.save();

    return pricing.toJSON();
  }

  async destroy(id: string, ...args: any) {
    const result = await PricingMongoose.deleteOne({ _id: id });
    return result?.deletedCount === 1;
  }
}

export default PricingRepository;
