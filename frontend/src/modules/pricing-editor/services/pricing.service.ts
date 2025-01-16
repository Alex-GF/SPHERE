import { AddOn, Feature, Plan, Pricing, UsageLimit } from 'pricing4ts';

import { PricingData, FormattedNamesProp } from '../components/pricing-renderer/types';

export function formatPricingComponentName(name: string) {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase());
}

export function pluralizeUnit(unit: string) {
  if (unit.includes('/')) {
    let [first, second] = unit.split('/');
    return `${first}s/${second}`;
  } else {
    return `${unit}s`;
  }
}

function initializeData(
  items: (Feature | UsageLimit)[],
  plansLength: number,
  pricingData: PricingData,
  errors: string[],
  formattedNames: FormattedNamesProp = {}
) {
  for (let item of items) {
    let isUsageLimit = 'unit' in item;

    if (!item.render) {
      item.render = 'auto';
    }

    if (item.render.toUpperCase() === 'ENABLED') {
      let formattedName = formatPricingComponentName(item.name);
      formattedNames[item.name] = formattedName;

      if (!pricingData[formattedName]) {
        pricingData[formattedName] = Array(plansLength).fill({
          value: item.defaultValue,
          unit: isUsageLimit ? (item as UsageLimit).unit : undefined,
          render: item.render,
          addonName: null,
          addonValue: null,
          addonExtension: false
        });
      }
    } else if (item.render.toUpperCase() === 'AUTO') {
      let formattedName = isUsageLimit
        ? formatPricingComponentName((item as UsageLimit).linkedFeatures ? (item as UsageLimit).linkedFeatures![0] : item.name)
        : formatPricingComponentName(item.name);

      formattedNames[item.name] = formattedName;

      if (!pricingData[formattedName]) {
        pricingData[formattedName] = Array(plansLength).fill({
          value: item.defaultValue,
          unit: isUsageLimit ? (item as UsageLimit).unit : undefined,
          render: item.render,
          addonName: null,
          addonValue: null,
          addonExtension: false
        });
      }
    } else if (item.render.toUpperCase() === 'DISABLED') {
      continue;
    } else {
      errors.push(`Unknown render mode for '${item.name}'`);
    }
  }
}

function populateData(
  items: { [key: string]: Feature } | { [key: string]: UsageLimit },
  planIndex: number,
  planName: string,
  pricingData: PricingData,
  formattedNames: FormattedNamesProp,
  errors: string[]
) {
  for (let item of Object.values(items)) {
    if (!item.render) {
      item.render = 'auto';
    }

    if (item.render.toUpperCase() === 'ENABLED' || item.render.toUpperCase() === 'AUTO') {
      let formattedName = formattedNames[item.name];

      if (
        (item.value === null || item.value === undefined) &&
        (item.defaultValue === null || item.defaultValue === undefined)
      ) {
        errors.push(`Missing value for '${formattedName}' in plan ${planName}`);
      }

      try {
        pricingData[formattedName][planIndex] = {
          value: item.value ?? item.defaultValue,
          unit: pricingData[formattedName][planIndex].unit,
          render: pricingData[formattedName][planIndex].render,
          addonName: null,
          addonValue: null,
          addonExtension: false
        };
      } catch (e) {
        continue;
      }
    }
  }
}

function populateAddonsData(
  items: { [key: string]: Feature } | { [key: string]: UsageLimit },
  addOnName: string,
  pricing: Pricing,
  pricingData: PricingData,
  formattedNames: FormattedNamesProp,
  errors: string[]
) {
  for (let item of Object.values(items)) {
    if (!item.render) {
      item.render = 'auto';
    }

    if (item.render.toUpperCase() === 'ENABLED' || item.render.toUpperCase() === 'AUTO') {
      let formattedName = formattedNames[item.name];

      if (item.value === null || item.value === undefined) {
        errors.push(`Missing value for '${formattedName}' in add-on ${addOnName}`);
      }

      let i = 0;

      for (let planName in pricing.plans) {
        try {
          pricingData[formattedName][i] = {
            ...pricingData[formattedName][i],
            addonName: addOnName,
            addonValue: Object.values(pricing.addOns!).find(a => a.name === addOnName)!.availableFor.includes(planName) ? item.value : null,
            addonExtension: false
          };
          i++;
        } catch (e) {
          i++;
          continue;
        }
      }
    }
  }
}

function populateAddonsExtensionsData(
  items: { [key: string]: Feature } | { [key: string]: UsageLimit },
  addOnName: string,
  pricing: Pricing,
  pricingData: PricingData,
  formattedNames: FormattedNamesProp,
  errors: string[]
) {
  for (let item of Object.values(items)) {
    if (!item.render) {
      item.render = 'auto';
    }

    if (item.render.toUpperCase() === 'ENABLED' || item.render.toUpperCase() === 'AUTO') {
      let formattedName = formattedNames[item.name];

      if (item.value === null || item.value === undefined) {
        errors.push(`Missing value for extension of '${formattedName}' in add-on ${addOnName}`);
      }

      for (let i = 0; i < (Object.values(pricing.plans!) ?? []).length; i++) {

        const planName = Object.values(pricing.plans!)[i].name;
        const addonValue = Object.values(pricing.addOns!).find(a => a.name === addOnName)!.availableFor.includes(planName) ? item.value : 0

        try {
          pricingData[formattedName][i] = {
            ...pricingData[formattedName][i],
            addonName: addOnName,
            value: (pricingData[formattedName][i].value as number) + addonValue,
            addonValue: addonValue,
            addonExtension: true,
          };
        } catch (e) {
          continue;
        }
      }
    }
  }
}

export function getPricingData(pricing: Pricing, errors: string[]) {
  let pricingData: PricingData = {};

  let formattedNames: FormattedNamesProp = {};

  initializeData(
    Object.values(pricing.usageLimits!) ?? [],
    (Object.values(pricing.plans!) ?? []).length,
    pricingData,
    errors,
    formattedNames
  );

  initializeData(Object.values(pricing.features), (Object.values(pricing.plans!) ?? []).length, pricingData, errors, formattedNames);

  let i = 0;

  for (let planName in pricing.plans) {
    let plan: Plan = pricing.plans[planName];
    
    populateData(plan.features, i, plan.name, pricingData, formattedNames, errors);
    populateData(plan.usageLimits ?? {}, i, plan.name, pricingData, formattedNames, errors);
    i++;
  }

  if (pricing.addOns) {
    for (let addOnName in pricing.addOns) {
      let addon: AddOn = pricing.addOns[addOnName];
      populateAddonsData(addon.features ?? {}, addon.name, pricing, pricingData, formattedNames, errors);
      populateAddonsData(addon.usageLimits ?? {}, addon.name, pricing, pricingData, formattedNames, errors);
      populateAddonsExtensionsData(
        addon.usageLimitsExtensions ?? {},
        addon.name,
        pricing,
        pricingData,
        formattedNames,
        errors
      );
    }
  }

  return pricingData;
}
