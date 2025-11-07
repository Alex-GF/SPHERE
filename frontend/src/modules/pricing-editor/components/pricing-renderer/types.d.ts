import { Pricing, RenderMode } from "pricing4ts";

export type PricingData = {
  [key: string]: {
    value: string | number | boolean;
    unit?: string;
    render: RenderMode;
    addonName: string | null;
    addonValue: string | number | boolean | null;
    addonExtension: boolean;
  }[];
};

export interface FormattedNamesProp {
  [key: string]: string;
}

type BilledType = "monthly" | "annually";

interface RenderingStyles {
  plansColor?: string;
  priceColor?: string;
  periodColor?: string;
  headerColor?: string;
  namesColor?: string;
  valuesColor?: string;
  checkColor?: string;
  crossColor?: string;
  backgroundColor?: string;
  dividerColor?: string;
  billingSelectionColor?: string;
  billingSelectionBackgroundColor?: string;
  billingSelectionTextColor?: string;
  addonBackgroundColor?: string;
  addonTextColor?: string;
}

interface PricingProps {
  pricing: Pricing;
  errors: string[];
  style?: RenderingStyles;
  onApplyVariables?: (variables: Record<string, string | number | boolean>) => void;
}