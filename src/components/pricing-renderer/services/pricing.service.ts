import { Feature, Plan, Pricing, UsageLimit } from "pricing4ts";

import { PricingData, FormattedNamesProp } from "../types.d";

export function formatPricingComponentName(name: string) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());
}

export function pluralizeUnit(unit: string) {
  if (unit.includes("/")) {
    let [first, second] = unit.split("/");
    return `${first}s/${second}`;
  } else {
    return `${unit}s`;
  }
}

function initializeData(
  items: (Feature | UsageLimit)[],
  plansLength: number,
  pricingData: PricingData,
  formattedNames: FormattedNamesProp = {}
) {
  for (let item of items) {
    let isUsageLimit = "unit" in item;

    if (!item.render) {
      item.render = "auto";
    }

    if (item.render.toUpperCase() === "ENABLED") {
      let formattedName = formatPricingComponentName(item.name);
      formattedNames[item.name] = formattedName;

      if (!pricingData[formattedName]) {
        pricingData[formattedName] = Array(plansLength).fill({
          value: item.defaultValue,
          unit: isUsageLimit ? (item as UsageLimit).unit : undefined,
          render: item.render,
        });
      }
    } else if (item.render.toUpperCase() === "AUTO") {
      let formattedName = isUsageLimit
        ? formatPricingComponentName((item as UsageLimit).linkedFeatures![0])
        : formatPricingComponentName(item.name);

      formattedNames[item.name] = formattedName;

      if (!pricingData[formattedName]) {
        pricingData[formattedName] = Array(plansLength).fill({
          value: item.defaultValue,
          unit: isUsageLimit ? (item as UsageLimit).unit : undefined,
          render: item.render,
        });
      }
    } else if (item.render.toUpperCase() === "DISABLED") {
      continue;
    } else {
      console.error(`Unknown render mode for '${item.name}'`);
    }
  }
}

function populateData(
  items: {[key: string]: Feature} | {[key: string]: UsageLimit},
  planIndex: number,
  planName: string,
  pricingData: PricingData,
  formattedNames: FormattedNamesProp
) {
  for (let item of Object.values(items)) {
    if (!item.render) {
      item.render = "auto";
    }

    if (item.render.toUpperCase() === "ENABLED" || item.render.toUpperCase() === "AUTO" || item.render.toUpperCase() === "DISABLED") {
      let formattedName = formattedNames[item.name];

      if ((item.value === null || item.value === undefined) &&
          (item.defaultValue === null || item.defaultValue === undefined)) {
        console.error(
          `Missing value for '${formattedName}' in plan ${planName}`
        );
      }

      try {
        pricingData[formattedName][planIndex] = {
          value: item.value ?? item.defaultValue,
          unit: pricingData[formattedName][planIndex].unit,
          render: pricingData[formattedName][planIndex].render,
        };
      } catch (e) {
        continue;
      }
    } else {
      console.error(`Unknown render mode for '${item.name}'`);
    }
  }

  return pricingData;
}

export function getPricingData(pricing: Pricing) {
  let pricingData: PricingData = {};

  let formattedNames: FormattedNamesProp = {};

  initializeData(
    pricing.usageLimits ?? [],
    pricing.plans.length,
    pricingData,
    formattedNames
  );
  initializeData(
    pricing.features,
    pricing.plans.length,
    pricingData,
    formattedNames
  );

  for (let i = 0; i < pricing.plans.length; i++) {
    let plan: Plan = pricing.plans[i];
    populateData(
      plan.usageLimits ?? {},
      i,
      plan.name,
      pricingData,
      formattedNames
    );
    populateData(plan.features, i, plan.name, pricingData, formattedNames);
  }

  return pricingData;
}
