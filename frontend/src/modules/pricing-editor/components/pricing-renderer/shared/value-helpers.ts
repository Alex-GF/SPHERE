import { pluralizeUnit } from '../../../services/pricing.service';

function formatNumberValue(value: number, unit?: string): string | number {
  if (value === 0) return '-';
  const unitText = value > 1 ? pluralizeUnit(unit ?? '') : unit;
  return `${value} ${unitText}`;
}

function applyAddonAdjustment(
  baseValue: number,
  addonValue?: number | null,
  addonExtension?: boolean
): number {
  if (addonValue && typeof addonValue === 'number' && addonValue !== 0) {
    return addonExtension ? baseValue - addonValue : baseValue;
  }
  return baseValue;
}

export function formatPricingValue(
  value: string | number,
  unit?: string,
  addonValue?: number | null,
  addonExtension?: boolean
): string | number {
  if (typeof value === 'number') {
    const adjusted = applyAddonAdjustment(value, addonValue, addonExtension);
    return formatNumberValue(adjusted, unit);
  }

  // fallback for non-number values
  return value;
}

