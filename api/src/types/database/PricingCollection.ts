import { User } from "./User";

export interface PricingCollection {
    name: string,
    owner: User,
    analytics: PricingCollectionAnalytics
}

export interface RetrievedCollection {
    name: string,
    owner: User,
    pricings: any,
    analytics: PricingCollectionAnalytics
}

export interface PricingCollectionAnalytics {
    evolutionOfPlans: ParameterEvolution,
    evolutionOfAddOns: ParameterEvolution,
    evolutionOfFeatures: ParameterEvolution,
    evolutionOfConfigurationSpaceSize: ParameterEvolution,
}

export type PricingCollectionAnalyticsToAdd = Record<string, AnalyticsParameter>

// export interface PricingCollectionAnalyticsToAdd {
//     evolutionOfPlans: AnalyticsParameter,
//     evolutionOfAddOns: AnalyticsParameter,
//     evolutionOfFeatures: AnalyticsParameter,
//     evolutionOfConfigurationSpaceSize: AnalyticsParameter,
// }

export interface ParameterEvolution {
    dates: Date[],
    values: number[]
}

export interface AnalyticsParameter {
    date: Date,
    value: number
}