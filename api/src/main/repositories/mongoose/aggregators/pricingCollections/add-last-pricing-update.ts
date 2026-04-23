import { PipelineStage } from 'mongoose';

export function addLastPricingUpdateAggregator(): PipelineStage[]{
  return [
    {
      $set: {
        lastUpdate: {
          $max: "$pricings.pricings.extractionDate"
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