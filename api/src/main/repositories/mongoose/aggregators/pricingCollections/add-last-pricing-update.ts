import { PipelineStage } from 'mongoose';

export function addLastPricingUpdateAggregator(): PipelineStage[]{
  return [
    {
      $set: {
        lastUpdate: {
          $max: "$pricings.pricings.createdAt"
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
  ]
}