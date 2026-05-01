import { PipelineStage } from 'mongoose';

export function addLastPricingUpdateAggregator(): PipelineStage[]{
  return [
    {
      $set: {
        lastUpdate: {
          $max: "$data.pricings.createdAt"
        }
      }
    },
    {
      $set: {
        lastUpdate: {
          $max: "$lastUpdate"
        }
      }
    }
  ];
}