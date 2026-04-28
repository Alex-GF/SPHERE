export type TestCollection = {
  id: string;
  name: string;
  description: string;
  _ownerName: string;
  private: boolean;
  analytics: {
    evolutionOfPlans: ParameterEvolutionSchema,
    evolutionOfAddOns: ParameterEvolutionSchema,
    evolutionOfFeatures: ParameterEvolutionSchema,
    evolutionOfConfigurationSpaceSize: ParameterEvolutionSchema,
  };
}

export type ParameterEvolutionSchema = {
  dates: Date[],
  values: number[],
}