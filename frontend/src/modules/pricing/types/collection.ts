import { AnalyticsDataEntry } from "../../../assets/data/analytics";

export interface Collection {
  name: string;
  description: string;
  owner: {
    id: string;
    username: string;
    avatar: string;
  };
  private: boolean;
  pricings: {
    pricings: AnalyticsDataEntry[],
    minPrice: CollectionPricingStat,
    maxPrice: CollectionPricingStat,
    configurationSpaceSize: CollectionPricingStat,
  }[];
  analytics: CollectionAnalytics;
  lastUpdate: string;
  numberOfPricings: number;
}

export interface CollectionAnalytics {
  evolutionOfPlans: ParameterEvolution;
  evolutionOfAddOns: ParameterEvolution;
  evolutionOfFeatures: ParameterEvolution;
  evolutionOfConfigurationSpaceSize: ParameterEvolution;
}

export interface ParameterEvolution {
  dates: string[];
  values: number[];
}

export interface CollectionPricingStat {
  min: number,
  max: number,
  data: {value: string, count: number}[],
}