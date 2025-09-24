import { Plan, AddOn, UsageLimit, PricingFeature } from '../../types';
import { FeatureTableSimple } from './components/FeatureTableSimple';
import { FeatureTableCollapsed } from './components/FeatureTableCollapsed';

interface FeatureTableProps {
  plans: Record<string, Plan>;
  features: Record<string, PricingFeature>;
  usageLimits: Record<string, UsageLimit>;
  addOns: Record<string, AddOn>;
  selectedPlan?: string;
  onSelect: (planKey: string) => void;
}

export function FeatureTable({ plans, features, usageLimits, addOns, selectedPlan, onSelect }: FeatureTableProps) {
  const planKeys = Object.keys(plans);
  
  if (planKeys.length <= 3) {
    return <FeatureTableSimple
      plans={plans}
      features={features}
      usageLimits={usageLimits}
      addOns={addOns}
      selectedPlan={selectedPlan}
      onSelect={onSelect}
    />
  }

  return <FeatureTableCollapsed
    plans={plans}
    features={features}
    usageLimits={usageLimits}
    addOns={addOns}
    selectedPlan={selectedPlan}
    onSelect={onSelect}
  />;
}
