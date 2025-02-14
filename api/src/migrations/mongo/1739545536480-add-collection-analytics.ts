import mongoose from 'mongoose';
import { getMongoDBConnectionURI } from '../../config/mongoose';
import PricingCollectionMongoose from '../../repositories/mongoose/models/PricingCollectionMongoose';
import { Pricing } from '../../types/database/Pricing';

export async function up(): Promise<void> {
  mongoose.connect(getMongoDBConnectionURI());

  const collections = await PricingCollectionMongoose.aggregate([
    {
      $lookup: {
        from: 'pricings',
        localField: '_id',
        foreignField: '_collectionId',
        as: 'pricings',
      },
    },
  ]);

  for (const collection of collections) {
    const newAnalytics = calculateAnalyticsForPricings(collection);

    await PricingCollectionMongoose.updateOne({
      _id: collection._id,
    }, {
      analytics: newAnalytics,
    });
  }
}

export async function down(): Promise<void> {
  mongoose.connect(getMongoDBConnectionURI());

  await PricingCollectionMongoose.updateMany(
    {},
    {
      $set: {
        analytics: {
          evolutionOfPlans: {
            dates: [],
            values: [],
          },
          evolutionOfAddOns: {
            dates: [],
            values: [],
          },
          evolutionOfFeatures: {
            dates: [],
            values: [],
          },
          evolutionOfConfigurationSpaceSize: {
            dates: [],
            values: [],
          },
        },
      },
    }
  );
}

const calculateAnalyticsForPricings = (collection: any) => {
  const extractionDates = _simulateCollectionEvolution(collection.pricings);

  const analyticsByMonth = _getAnalyticsEvolution(extractionDates);

  return {
    evolutionOfPlans: {
      dates: Object.keys(analyticsByMonth),
      values: Object.values(analyticsByMonth).map(analytics => analytics.avgPlans),
    },
    evolutionOfAddOns: {
      dates: Object.keys(analyticsByMonth),
      values: Object.values(analyticsByMonth).map(analytics => analytics.avgAddOns),
    },
    evolutionOfFeatures: {
      dates: Object.keys(analyticsByMonth),
      values: Object.values(analyticsByMonth).map(analytics => analytics.avgFeatures),
    },
    evolutionOfConfigurationSpaceSize: {
      dates: Object.keys(analyticsByMonth),
      values: Object.values(analyticsByMonth).map(
        analytics => analytics.avgConfigurationSpaceSize
      ),
    },
  };
};

function _simulateCollectionEvolution(pricings: Pricing[]) {
  const pricingsByDate: Record<string, any[]> = {};

  const extractionDates = pricings.map((pricing: any) => new Date(pricing.extractionDate));
  const minDate = new Date(Math.min(...extractionDates.map(date => date.getTime())));
  const maxDate = new Date(Math.max(...extractionDates.map(date => date.getTime())));
  maxDate.setMonth(maxDate.getMonth() + 1); // Added four months to include the pricing with the las extraction date and stabilise the analytics

  for (let date = new Date(minDate); date <= maxDate; date.setMonth(date.getMonth() + 1)) {
    const isoDate = date.toISOString().split('T')[0];
    const filteredPricings = pricings.filter(
      (pricing: any) => new Date(pricing.extractionDate) <= date
    );

    const latestPricings: Record<string, any> = {};

    // If many versions of the same pricing pass the filter, select the most recent version
    for (const pricing of filteredPricings) {
      if (
        !latestPricings[pricing.name] ||
        new Date(pricing.extractionDate) > new Date(latestPricings[pricing.name].extractionDate)
      ) {
        latestPricings[pricing.name] = pricing;
      }
    }

    pricingsByDate[isoDate] = Object.values(latestPricings);
  }

  return pricingsByDate;
}

function _getAnalyticsEvolution(extractionDates: Record<string, any>) {
  const analyticsEvolution: Record<
    string,
    { avgPlans: number; avgAddOns: number; avgFeatures: number; avgConfigurationSpaceSize: number }
  > = {};

  for (const date in extractionDates) {
    const pricings = extractionDates[date];
    
    analyticsEvolution[date] = {
      avgPlans:
        pricings.reduce((acc: number, pricing: any) => acc + pricing.analytics.numberOfPlans, 0) /
        pricings.length,
      avgAddOns:
        pricings.reduce((acc: number, pricing: any) => acc + pricing.analytics.numberOfAddOns, 0) /
        pricings.length,
      avgFeatures:
        pricings.reduce(
          (acc: number, pricing: any) => acc + pricing.analytics.numberOfFeatures,
          0
        ) / pricings.length,
      avgConfigurationSpaceSize:
        pricings.reduce(
          (acc: number, pricing: any) => acc + pricing.analytics.configurationSpaceSize,
          0
        ) / pricings.length,
    };
  }

  return analyticsEvolution;
}
