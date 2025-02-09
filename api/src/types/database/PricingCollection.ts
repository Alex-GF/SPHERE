import { User } from "./User";

export interface PricingCollection {
    name: string,
    owner: User,
    analytics: PricingCollectionAnalytics
}

export interface PricingCollectionAnalytics {
    evolutionOfPlans: { type: ParameterEvolution, required: false },
    evolutionOfAddOns: { type: ParameterEvolution, required: false },
    evolutionOfFeatures: { type: ParameterEvolution, required: false },
    evolutionOfConfigurationSpaceSize: { type: ParameterEvolution, required: false },
}

export interface ParameterEvolution {
    dates: Date[],
    values: number[]
}