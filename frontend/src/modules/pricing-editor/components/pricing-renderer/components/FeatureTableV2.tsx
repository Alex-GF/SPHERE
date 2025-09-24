// React import not required in modern JSX runtime
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableRow, Box, Typography } from '@mui/material';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Feature, Plan, AddOn, UsageLimit } from 'pricing4ts';
import { getPlanGradient } from '../shared/planPalette';
import { camelToTitle } from '../shared/stringUtils';
import { formatUsageDisplay } from '../shared/value-helpers';

interface FeatureTableV2Props {
  plans: Record<string, Plan>;
  features: Record<string, Feature>;
  usageLimits: Record<string, UsageLimit> | undefined;
  addOns: Record<string, AddOn> | undefined;
  currency?: string | undefined;
}

export function FeatureTableV2({ plans, features, usageLimits, addOns, currency }: Readonly<FeatureTableV2Props>) {
  const planKeys = Object.keys(plans);
  const featureKeys = Object.keys(features);
  const addOnKeys = Object.keys(addOns ?? {});

  // Helper: determine if an add-on (by key) is effectively available for a plan,
  // taking into account its `availableFor` and recursive `dependsOn` (which may be names or keys).
  function isAddOnAvailableForPlan(addOnKey: string, planKey: string, seen = new Set<string>()): boolean {
    if (!addOns) return false;
    if (seen.has(addOnKey)) return false; // protect against cycles
    seen.add(addOnKey);
    const ao = addOns[addOnKey];
    if (!ao) return false;
    // If availableFor empty/undefined => available for all plans
    if (!ao.availableFor || ao.availableFor.length === 0) {
      // but its dependencies may restrict it: if any dependency is not available for the plan, the add-on is not available
      if (!ao.dependsOn || ao.dependsOn.length === 0) return true;
      // check dependencies
      return ao.dependsOn.every(depName => {
        // try to resolve dependency as a key first
        const depKey = Object.keys(addOns).find(k => k === depName || addOns[k].name === depName);
        if (!depKey) return false;
        return isAddOnAvailableForPlan(depKey, planKey, new Set(seen));
      });
    }
    // availableFor present: require planKey to be included
    if (!ao.availableFor.includes(planKey)) return false;
    // if the add-on has dependencies, they must also be available for the plan
    if (!ao.dependsOn || ao.dependsOn.length === 0) return true;
    return ao.dependsOn.every(depName => {
      const depKey = Object.keys(addOns).find(k => k === depName || addOns[k].name === depName);
      if (!depKey) return false;
      return isAddOnAvailableForPlan(depKey, planKey, new Set(seen));
    });
  }

  // Build rows according to render rules for features and usageLimits
  type Row = { id: string; type: 'feature' | 'usageLimit'; key: string };
  const rows: Row[] = [];

  // map featureKey -> linked usageLimit keys
  const usageByFeature: Record<string, string[]> = {};
  for (const ulKey of Object.keys(usageLimits ?? {})) {
    const ul = usageLimits?.[ulKey];
    if (!ul) continue;
    for (const fk of ul.linkedFeatures ?? []) {
      usageByFeature[fk] = usageByFeature[fk] ?? [];
      if (!usageByFeature[fk].includes(ulKey)) usageByFeature[fk].push(ulKey);
    }
  }

  // Small helper to read an optional `render` flag from an object without using `any`.
  function getRenderFlagFrom(obj?: unknown): string {
    if (!obj) return 'AUTO';
    const r = (obj as Record<string, unknown>)['render'];
    if (typeof r === 'string' || typeof r === 'number' || typeof r === 'boolean') return String(r).toUpperCase();
    return 'AUTO';
  }
  const renderFlagOfFeature = (f?: Feature) => getRenderFlagFrom(f);
  const renderFlagOfUsage = (ul?: UsageLimit) => getRenderFlagFrom(ul);

  // precompute whether a usageLimit should be rendered at all
  const usageShouldRender: Record<string, boolean> = {};
  for (const ulKey of Object.keys(usageLimits ?? {})) {
    const ul = usageLimits?.[ulKey];
    if (!ul) continue;
    const urender = renderFlagOfUsage(ul);
    if (urender === 'DISABLED') {
      usageShouldRender[ulKey] = false;
      continue;
    }
    if (urender === 'ENABLED') {
      usageShouldRender[ulKey] = true;
      continue;
    }
    // AUTO: by default do not render a separate usageLimit row unless
    // at least one of its linked features is linked to more than one usageLimit
    const linked = ul.linkedFeatures ?? [];
    let anyNonDisabled = false;
    let anyFeatureHasMultipleLimits = false;
    let allLinkedFeaturesAreAuto = true;
    for (const fk of linked) {
      const f = features[fk];
      const fr = renderFlagOfFeature(f);
      if (fr !== 'DISABLED') anyNonDisabled = true;
      const count = (usageByFeature[fk] ?? []).length;
      if (count > 1) anyFeatureHasMultipleLimits = true;
      if (fr !== 'AUTO') allLinkedFeaturesAreAuto = false;
    }
    // Render AUTO usageLimit as separate row if:
    // - some linked feature is non-disabled AND
    // - either some linked feature has multiple usageLimits (ambiguity), OR the usageLimit is linked to >1 features all in AUTO
    usageShouldRender[ulKey] = anyNonDisabled && (anyFeatureHasMultipleLimits || (linked.length > 1 && allLinkedFeaturesAreAuto));
  }

  const renderedUsage = new Set<string>();

  // iterate features in original order
  featureKeys.forEach((featureKey) => {
    const f = features[featureKey];
    const fr = renderFlagOfFeature(f);

    // If feature is not DISABLED, include its feature row
    if (fr !== 'DISABLED') {
      rows.push({ id: `feature:${featureKey}`, type: 'feature', key: featureKey });
    }

    // For each usageLimit linked to this feature, decide whether to render it now
    for (const ulKey of usageByFeature[featureKey] ?? []) {
      if (renderedUsage.has(ulKey)) continue;
      const ul = usageLimits?.[ulKey];
      if (!ul) continue;
      const ur = renderFlagOfUsage(ul);
      // if usage limit explicitly disabled, skip
      if (ur === 'DISABLED') continue;

      // Conditions to render usage limit now:
      // - usage limit ENABLED -> always render
      // - feature ENABLED -> render its linked usageLimits
      // - usage limit AUTO and at least one linked feature is not DISABLED -> render when we hit a non-disabled linked feature
      const linkedFeatures = ul.linkedFeatures ?? [];
      const anyNonDisabled = linkedFeatures.some(fk => { const ff = features[fk]; const r = renderFlagOfFeature(ff); return r !== 'DISABLED'; });
      const linkedFeatureHasMultiple = linkedFeatures.some(fk => (usageByFeature[fk] ?? []).length > 1);
      const allLinkedAreAuto = linkedFeatures.length > 0 && linkedFeatures.every(fk => renderFlagOfFeature(features[fk]) === 'AUTO');
      if (ur === 'ENABLED' || fr === 'ENABLED' || (ur === 'AUTO' && anyNonDisabled && fr !== 'DISABLED' && (linkedFeatureHasMultiple || (linkedFeatures.length > 1 && allLinkedAreAuto)))) {
        rows.push({ id: `usage:${ulKey}`, type: 'usageLimit', key: ulKey });
        renderedUsage.add(ulKey);
      }
    }
  });

  // Append any remaining usage limits that should render but were not attached (e.g., linked to no feature or their feature was DISABLED but usageLimit.ENABLED)
  for (const ulKey of Object.keys(usageLimits ?? {})) {
    if (renderedUsage.has(ulKey)) continue;
    if (!usageShouldRender[ulKey]) continue;
    rows.push({ id: `usage:${ulKey}`, type: 'usageLimit', key: ulKey });
    renderedUsage.add(ulKey);
  }

  return (
    <Box sx={{ overflowX: 'auto', mt: 2 }}>
      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}></TableCell>
            {planKeys.map((planKey, idx) => (
              <TableCell key={planKey} align='center' sx={{ background: getPlanGradient(idx), color: '#fff', fontWeight: "bolder", minWidth: 160, fontSize: 18 }}>
                <Typography sx={{ fontWeight: 700 }}>{plans[planKey].name ?? camelToTitle(planKey)}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{plans[planKey].price === 0 ? 'FREE' : <>{plans[planKey].price}{typeof plans[planKey].price === 'number' ? (currency ?? '') : ''}</>}</Typography>
                {typeof plans[planKey].unit === 'string' && (
                  <Typography variant='caption'>{plans[planKey].unit}</Typography>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rIdx) => {
            if (row.type === 'feature') {
              const featureKey = row.key;
              // compute feature and its render flag here (was previously only available during row construction)
              const f = features[featureKey];
              const fr = renderFlagOfFeature(f);
              return (
                <motion.tr key={row.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + rIdx * 0.02 }}>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 600 }}>{camelToTitle(features[featureKey].name) ?? camelToTitle(featureKey)}</TableCell>
                  {planKeys.map((planKey) => {
                    const plan = plans[planKey];
                    const planFeaturesRecord = plan.features as Record<string, unknown> | undefined;
                    const planRaw = planFeaturesRecord ? planFeaturesRecord[featureKey] : undefined;
                    // safely extract value or defaultValue from the plan feature record
                    let rawValue: unknown = undefined;
                    if (planRaw) {
                      const pr = planRaw as Record<string, unknown>;
                      rawValue = typeof pr['value'] !== 'undefined' ? pr['value'] : pr['defaultValue'];
                    }

                    // If this feature is provided by an add-on available for this plan
                    const providedByAddOn = addOnKeys.some(addOnKey => {
                      const ao = addOns?.[addOnKey];
                      if (!ao) return false;
                      const provides = ao.features?.[featureKey];
                      if (!provides) return false;
                      return isAddOnAvailableForPlan(addOnKey, planKey);
                    });

                    // Special-case: if this feature has exactly one linked usageLimit, that usageLimit is AUTO
                    // and the feature itself is AUTO, then render the usageLimit values inside this feature's cells.
                    const linkedUlKeys = usageByFeature[featureKey] ?? [];
                    const singleUlKey = linkedUlKeys.length === 1 ? linkedUlKeys[0] : undefined;
                    const showSingleUsageInline = typeof singleUlKey !== 'undefined' && renderFlagOfUsage(usageLimits?.[singleUlKey]) === 'AUTO' && fr === 'AUTO' && !usageShouldRender[singleUlKey ?? ''];
                    if (showSingleUsageInline) {
                      const ulKey = linkedUlKeys[0];
                      const ul = usageLimits?.[ulKey];
                      const limitName = ul?.name ?? ulKey;
                      const planLimitVal = plan.usageLimits ? (plan.usageLimits as Record<string, unknown>)[limitName] : undefined;
                      const effective = typeof planLimitVal !== 'undefined' && planLimitVal !== null ? planLimitVal : ul?.defaultValue;
                      const hasEffective = effective !== undefined && effective !== null && !(typeof effective === 'string' && String(effective).trim() === '');
                      if (hasEffective) {
                        return (
                          <TableCell key={planKey} align='center'>
                            <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 2, background: 'linear-gradient(90deg,#34d399,#10b981)', color: '#fff', fontWeight: 700 }}>
                              {formatUsageDisplay(effective, ul)}
                            </Box>
                          </TableCell>
                        );
                      }
                    }

                    // If boolean true -> check
                    if (typeof rawValue === 'boolean' && rawValue === true) {
                      return (
                        <TableCell key={planKey} align='center'>
                          <FaCheckCircle style={{ color: '#16a34a', fontSize: '1.25rem' }} />
                        </TableCell>
                      );
                    }

                    if (typeof rawValue === 'string' || typeof rawValue === 'number') {
                      return (
                        <TableCell key={planKey} align='center'>
                          <Box sx={{ fontWeight: 700 }}>{String(rawValue)}</Box>
                        </TableCell>
                      );
                    }

                    if (providedByAddOn) {
                      return (
                        <TableCell key={planKey} align='center'>
                          <Box sx={{ color: 'text.secondary' }}>Add-on</Box>
                        </TableCell>
                      );
                    }

                    // fallback cross
                    return (
                      <TableCell key={planKey} align='center'>
                        <FaTimesCircle style={{ color: '#9ca3af', fontSize: '1.25rem' }} />
                      </TableCell>
                    );
                  })}
                </motion.tr>
              );
            }

            // usageLimit row
            const ulKey = row.key;
            const ul = usageLimits?.[ulKey];
            return (
              <motion.tr key={row.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + rIdx * 0.02 }}>
                <TableCell component='th' scope='row' sx={{ fontWeight: 600 }}>{camelToTitle(ul?.name ?? ulKey)}</TableCell>
                {planKeys.map((planKey) => {
                  const plan = plans[planKey];
                  const limitVal = plan.usageLimits?.[ul?.name ?? ''];
                  const effective = limitVal ?? ul?.defaultValue;
                  const hasEffective = effective !== undefined && effective !== null && !(typeof effective === 'string' && String(effective).trim() === '');
                  if (hasEffective) {
                    return (
                      <TableCell key={planKey} align='center'>
                        <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 2, background: 'linear-gradient(90deg,#34d399,#10b981)', color: '#fff', fontWeight: 700 }}>
                          {formatUsageDisplay(effective, ul)}
                        </Box>
                      </TableCell>
                    );
                  }

                  // If not set but available via add-on? add-ons may extend usageLimits via usageLimitsExtensions — not covered here explicitly
                  return (
                    <TableCell key={planKey} align='center'>
                      <FaTimesCircle style={{ color: '#9ca3af', fontSize: '1.25rem' }} />
                    </TableCell>
                  );
                })}
              </motion.tr>
            );
          })}
          {/* selection buttons removed for editor: not needed */}
        </TableBody>
      </Table>
    </Box>
  );
}

export default FeatureTableV2;
