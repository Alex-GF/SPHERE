import { AnimatePresence, motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FaChevronDown } from 'react-icons/fa6';
import { AddOn, Feature, Plan, UsageLimit } from 'pricing4ts';
import { camelToTitle } from '../shared/stringUtils';
import { formatMoneyDisplay, formatUsageDisplay } from '../shared/value-helpers';
import { useState } from 'react';

interface FeatureTableV2Props {
  plans: Record<string, Plan>;
  features: Record<string, Feature>;
  usageLimits: Record<string, UsageLimit> | undefined;
  addOns: Record<string, AddOn> | undefined;
  currency?: string | undefined;
}

type Row = { id: string; type: 'feature' | 'usageLimit'; key: string };

const PLAN_HEADER_CLASSES = [
  'bg-[linear-gradient(to_right,#7c3aed,#6d28d9,#4c1d95)]',
  'bg-[linear-gradient(to_right,#2563eb,#1e40af,#0b61d8)]',
  'bg-[linear-gradient(to_right,#059669,#047857,#065f46)]',
  'bg-[linear-gradient(to_right,#ec4899,#be185d,#9d174d)]',
  'bg-[linear-gradient(to_right,#14b8a6,#0f766e,#0b6158)]',
  'bg-[linear-gradient(to_right,#ef4444,#b91c1c,#7f1d1d)]',
  'bg-[linear-gradient(to_right,#f59e0b,#d97706,#92400e)]',
  'bg-[linear-gradient(to_right,#0ea5e9,#0369a1,#075985)]',
];

function getRenderFlagFrom(obj?: unknown): string {
  if (!obj) return 'AUTO';
  const renderValue = (obj as Record<string, unknown>)['render'];
  if (typeof renderValue === 'string' || typeof renderValue === 'number' || typeof renderValue === 'boolean') {
    return String(renderValue).toUpperCase();
  }
  return 'AUTO';
}

function hasNonEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return value !== 0;
  return true;
}

export function FeatureTableV2({ plans, features, usageLimits, addOns, currency }: Readonly<FeatureTableV2Props>) {
  const planKeys = Object.keys(plans);
  const featureKeys = Object.keys(features);
  const addOnKeys = Object.keys(addOns ?? {});

  const renderFlagOfFeature = (feature?: Feature) => getRenderFlagFrom(feature);
  const renderFlagOfUsage = (limit?: UsageLimit) => getRenderFlagFrom(limit);

  const usageByFeature: Record<string, string[]> = {};
  for (const usageKey of Object.keys(usageLimits ?? {})) {
    const usage = usageLimits?.[usageKey];
    if (!usage) continue;

    for (const featureKey of usage.linkedFeatures ?? []) {
      usageByFeature[featureKey] = usageByFeature[featureKey] ?? [];
      if (!usageByFeature[featureKey].includes(usageKey)) {
        usageByFeature[featureKey].push(usageKey);
      }
    }
  }

  const usageShouldRender: Record<string, boolean> = {};
  for (const usageKey of Object.keys(usageLimits ?? {})) {
    const usage = usageLimits?.[usageKey];
    if (!usage) continue;

    const usageRender = renderFlagOfUsage(usage);
    if (usageRender === 'DISABLED') {
      usageShouldRender[usageKey] = false;
      continue;
    }

    if (usageRender === 'ENABLED') {
      usageShouldRender[usageKey] = true;
      continue;
    }

    const globalLinked = usage.linkedFeatures ?? [];
    const multiLinked = globalLinked.length > 1;

    let anyNonDisabled = false;
    let hasAmbiguousFeature = false;
    let allLinkedAuto = true;

    for (const featureKey of globalLinked) {
      const featureRender = renderFlagOfFeature(features[featureKey]);
      if (featureRender !== 'DISABLED') anyNonDisabled = true;
      if ((usageByFeature[featureKey] ?? []).length > 1) hasAmbiguousFeature = true;
      if (featureRender !== 'AUTO') allLinkedAuto = false;
    }

    if (multiLinked) {
      usageShouldRender[usageKey] = anyNonDisabled;
    } else {
      usageShouldRender[usageKey] = anyNonDisabled && (hasAmbiguousFeature || (globalLinked.length > 1 && allLinkedAuto));
    }
  }

  function isAddOnAvailableForPlan(addOnKey: string, planKey: string, seen = new Set<string>()): boolean {
    if (!addOns) return false;
    if (seen.has(addOnKey)) return false;

    seen.add(addOnKey);
    const addOn = addOns[addOnKey];
    if (!addOn) return false;

    if (addOn.availableFor && addOn.availableFor.length > 0 && !addOn.availableFor.includes(planKey)) {
      return false;
    }

    if (!addOn.dependsOn || addOn.dependsOn.length === 0) {
      return true;
    }

    return addOn.dependsOn.every(depName => {
      const depKey = Object.keys(addOns).find(key => key === depName || addOns[key].name === depName);
      if (!depKey) return false;
      return isAddOnAvailableForPlan(depKey, planKey, new Set(seen));
    });
  }

  function buildRowsForFeatures(featureKeysToUse: string[]): Row[] {
    const rows: Row[] = [];
    const usageByFeatureLocal: Record<string, string[]> = {};

    for (const usageKey of Object.keys(usageLimits ?? {})) {
      const usage = usageLimits?.[usageKey];
      if (!usage) continue;

      for (const featureKey of usage.linkedFeatures ?? []) {
        if (!featureKeysToUse.includes(featureKey)) continue;

        usageByFeatureLocal[featureKey] = usageByFeatureLocal[featureKey] ?? [];
        if (!usageByFeatureLocal[featureKey].includes(usageKey)) {
          usageByFeatureLocal[featureKey].push(usageKey);
        }
      }
    }

    const usageShouldRenderLocal: Record<string, boolean> = {};
    for (const usageKey of Object.keys(usageLimits ?? {})) {
      const usage = usageLimits?.[usageKey];
      if (!usage) continue;

      const usageRender = renderFlagOfUsage(usage);
      if (usageRender === 'DISABLED') {
        usageShouldRenderLocal[usageKey] = false;
        continue;
      }

      if (usageRender === 'ENABLED') {
        usageShouldRenderLocal[usageKey] = true;
        continue;
      }

      const globalLinked = usage.linkedFeatures ?? [];
      const localLinked = globalLinked.filter(featureKey => featureKeysToUse.includes(featureKey));
      const isMultiLinked = globalLinked.length > 1;

      let anyNonDisabled = false;
      let hasAmbiguousFeature = false;
      let allLinkedAuto = true;

      for (const featureKey of localLinked) {
        const featureRender = renderFlagOfFeature(features[featureKey]);
        if (featureRender !== 'DISABLED') anyNonDisabled = true;
        if ((usageByFeature[featureKey] ?? []).length > 1) hasAmbiguousFeature = true;
        if (featureRender !== 'AUTO') allLinkedAuto = false;
      }

      if (isMultiLinked) {
        usageShouldRenderLocal[usageKey] = localLinked.length > 0 && anyNonDisabled;
      } else {
        usageShouldRenderLocal[usageKey] = anyNonDisabled && (hasAmbiguousFeature || (localLinked.length > 1 && allLinkedAuto));
      }
    }

    const renderedUsage = new Set<string>();

    for (const featureKey of featureKeysToUse) {
      const featureRender = renderFlagOfFeature(features[featureKey]);
      if (featureRender !== 'DISABLED') {
        rows.push({ id: `feature:${featureKey}`, type: 'feature', key: featureKey });
      }

      for (const usageKey of usageByFeatureLocal[featureKey] ?? []) {
        if (renderedUsage.has(usageKey)) continue;

        const usage = usageLimits?.[usageKey];
        if (!usage) continue;

        const usageRender = renderFlagOfUsage(usage);
        if (usageRender === 'DISABLED') continue;

        const globalLinked = usage.linkedFeatures ?? [];
        const linkedFeatures = globalLinked.filter(key => featureKeysToUse.includes(key));
        const anyNonDisabled = linkedFeatures.some(key => renderFlagOfFeature(features[key]) !== 'DISABLED');
        const hasMultiple = linkedFeatures.some(key => (usageByFeature[key] ?? []).length > 1);
        const allAuto = linkedFeatures.length > 0 && linkedFeatures.every(key => renderFlagOfFeature(features[key]) === 'AUTO');
        const multiLinkedGlobal = globalLinked.length > 1;

        const shouldRender = usageRender === 'ENABLED' ||
          featureRender === 'ENABLED' ||
          (usageRender === 'AUTO' && anyNonDisabled && featureRender !== 'DISABLED' && (multiLinkedGlobal || hasMultiple || (linkedFeatures.length > 1 && allAuto)));

        if (shouldRender) {
          rows.push({ id: `usage:${usageKey}`, type: 'usageLimit', key: usageKey });
          renderedUsage.add(usageKey);
        }
      }
    }

    for (const usageKey of Object.keys(usageLimits ?? {})) {
      if (renderedUsage.has(usageKey)) continue;
      if (!usageShouldRenderLocal[usageKey]) continue;

      rows.push({ id: `usage:${usageKey}`, type: 'usageLimit', key: usageKey });
      renderedUsage.add(usageKey);
    }

    return rows;
  }

  const tagToFeatureKeys: Record<string, string[]> = {};
  const untaggedFeatureKeys: string[] = [];

  for (const featureKey of featureKeys) {
    const feature = features[featureKey] as Feature & { tag?: string };
    const tag = typeof feature.tag === 'string' ? feature.tag.trim() : '';

    if (tag) {
      tagToFeatureKeys[tag] = tagToFeatureKeys[tag] ?? [];
      tagToFeatureKeys[tag].push(featureKey);
    } else {
      untaggedFeatureKeys.push(featureKey);
    }
  }

  const sortedTags = Object.keys(tagToFeatureKeys).sort((a, b) => a.localeCompare(b));
  const [openTags, setOpenTags] = useState<Record<string, boolean>>({});

  function isTagOpen(tag: string, index: number): boolean {
    const local = openTags[tag];
    if (typeof local === 'boolean') return local;
    return index === 0;
  }

  function toggleTag(tag: string, index: number) {
    setOpenTags(prev => ({
      ...prev,
      [tag]: !isTagOpen(tag, index),
    }));
  }

  function renderTable(featureBucket: string[]) {
    const rows = buildRowsForFeatures(featureBucket);

    return (
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left" />
            {planKeys.map((planKey, index) => {
              const plan = plans[planKey];
              const planName = plan.name ?? camelToTitle(planKey);
              const planHeaderClass = PLAN_HEADER_CLASSES[index % PLAN_HEADER_CLASSES.length];

              return (
                <th key={planKey} className="align-top">
                  <div className={`flex h-[124px] flex-col items-center justify-center text-center text-white shadow-sm ${planHeaderClass}`}>
                    <p className="text-[24px] tracking-[0.04em]">{String(planName).toUpperCase()}</p>
                    <p className="text-[20px]">
                      {plan.price === 0
                        ? 'FREE'
                        : `${formatMoneyDisplay(plan.price)}${typeof plan.price === 'number' ? (currency ?? '') : ''}`}
                    </p>
                    {typeof plan.unit === 'string' && (
                      <p className="text-[16px] opacity-90">{plan.unit}</p>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <motion.tbody layout>
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((row, rowIndex) => {
            if (row.type === 'feature') {
              const featureKey = row.key;
              const feature = features[featureKey];
              const featureRender = renderFlagOfFeature(feature);

              return (
                <motion.tr
                  key={row.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: 0.04 * rowIndex, duration: 0.35 }}
                >
                  <th scope="row" className="p-[16px] text-left text-[16px] font-bold leading-tight text-slate-700">
                    {camelToTitle(feature.name) ?? camelToTitle(featureKey)}
                  </th>

                  {planKeys.map(planKey => {
                    const plan = plans[planKey];
                    const featureValues = plan.features as Record<string, unknown> | undefined;
                    const featureRaw = featureValues ? featureValues[featureKey] : undefined;

                    let rawValue: unknown = undefined;
                    if (featureRaw) {
                      const featureRecord = featureRaw as Record<string, unknown>;
                      rawValue = typeof featureRecord['value'] !== 'undefined' ? featureRecord['value'] : featureRecord['defaultValue'];
                    }

                    const providedByAddOn = addOnKeys.some(addOnKey => {
                      const addOn = addOns?.[addOnKey];
                      if (!addOn || !addOn.features?.[featureKey]) return false;
                      return isAddOnAvailableForPlan(addOnKey, planKey);
                    });

                    const linkedUsageKeys = usageByFeature[featureKey] ?? [];
                    const singleUsageKey = linkedUsageKeys.length === 1 ? linkedUsageKeys[0] : undefined;
                    const showInlineUsage = typeof singleUsageKey !== 'undefined' &&
                      renderFlagOfUsage(usageLimits?.[singleUsageKey]) === 'AUTO' &&
                      featureRender === 'AUTO' &&
                      !usageShouldRender[singleUsageKey];

                    if (showInlineUsage) {
                      const usage = usageLimits?.[singleUsageKey as string];
                      const usageName = usage?.name ?? singleUsageKey;
                      const planUsage = plan.usageLimits
                        ? (plan.usageLimits as Record<string, UsageLimit>)[usageName].value
                        : undefined;
                      const effectiveUsage = hasNonEmptyValue(planUsage) ? planUsage : usage?.defaultValue;

                      if (hasNonEmptyValue(effectiveUsage)) {
                        return (
                          <td key={planKey} className="py-5 text-center align-middle">
                            <span className="inline-flex items-center justify-center rounded-[8px] bg-emerald-500 px-5 py-2 text-[14px] font-bold leading-none text-white">
                              {formatUsageDisplay(effectiveUsage, usage)}
                            </span>
                          </td>
                        );
                      }
                    }

                    if (typeof rawValue === 'boolean' && rawValue) {
                      return (
                        <td key={planKey} className="py-5 text-center align-middle">
                          <FaCheckCircle className="mx-auto text-[20px] text-emerald-600" />
                        </td>
                      );
                    }

                    if (typeof rawValue === 'string' || typeof rawValue === 'number') {
                      return (
                        <td key={planKey} className="py-5 text-center align-middle">
                          <span className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">{String(rawValue)}</span>
                        </td>
                      );
                    }

                    if (providedByAddOn) {
                      return (
                        <td key={planKey} className="py-5 text-center align-middle">
                          <span className="text-[14px] font-semibold text-slate-500">Add-on</span>
                        </td>
                      );
                    }

                    return (
                      <td key={planKey} className="py-5 text-center align-middle">
                        <FaTimesCircle className="mx-auto text-[20px] text-slate-400" />
                      </td>
                    );
                  })}
                </motion.tr>
              );
            }

            const usageKey = row.key;
            const usage = usageLimits?.[usageKey];

            return (
              <motion.tr
                key={row.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: 0.04 * rowIndex, duration: 0.18 }}
              >
                <th scope="row" className="px-4 py-5 text-left text-[16px] font-bold leading-tight text-slate-700">
                  {camelToTitle(usage?.name ?? usageKey)}
                </th>

                {planKeys.map(planKey => {
                  const plan = plans[planKey];
                  const valueFromPlan = plan.usageLimits?.[usage?.name ?? ''];
                  const effectiveUsage = hasNonEmptyValue(valueFromPlan) ? valueFromPlan : usage?.defaultValue;

                  if (hasNonEmptyValue(effectiveUsage)) {
                    return (
                      <td key={planKey} className="py-5 text-center align-middle">
                        <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-[14px] font-bold leading-none text-white">
                          {formatUsageDisplay(effectiveUsage, usage)}
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td key={planKey} className="py-5 text-center align-middle">
                      <FaTimesCircle className="mx-auto text-[20px] text-slate-400" />
                    </td>
                  );
                })}
              </motion.tr>
            );
          })}
          </AnimatePresence>
        </motion.tbody>
      </table>
    );
  }

  return (
    <div className="mt-8 w-full overflow-x-auto">
      {renderTable(untaggedFeatureKeys)}

      {sortedTags.map((tag, index) => {
        const open = isTagOpen(tag, index);
        const tagPanelId = `tag-panel-${tag.replace(/\s+/g, '-').toLowerCase()}`;

        return (
          <div key={tag} className="mt-5 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => toggleTag(tag, index)}
              className="flex w-full items-center justify-between bg-slate-100 px-5 py-4 text-left text-[16px] font-semibold text-slate-800 transition-colors hover:bg-slate-200"
              aria-expanded={open}
              aria-controls={tagPanelId}
            >
              <span>{tag}</span>
              <motion.span
                initial={false}
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="inline-flex text-slate-500"
                aria-hidden
              >
                <FaChevronDown className="h-4 w-4" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={tagPanelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto border-t border-slate-200 px-1 pb-3 pt-2">{renderTable(tagToFeatureKeys[tag])}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default FeatureTableV2;
