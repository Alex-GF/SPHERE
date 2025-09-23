// React import not required in modern JSX runtime
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Feature, Plan, AddOn, UsageLimit } from 'pricing4ts';
import { getPlanGradient } from '../shared/planPalette';
import { camelToTitle } from '../shared/stringUtils';

interface FeatureTableV2Props {
  plans: Record<string, Plan>;
  features: Record<string, Feature>;
  usageLimits: Record<string, UsageLimit> | undefined;
  addOns: Record<string, AddOn> | undefined;
}

function safePrimitive(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  // If it's an object that has a 'value' or 'defaultValue' property, prefer them
  if (typeof v === 'object' && v !== null) {
    try {
      const s = JSON.stringify(v);
      return s.length > 80 ? s.slice(0, 77) + '...' : s;
    } catch {
      return '[object]';
    }
  }
  return String(v as string | number | boolean);
}

function formatUsageDisplay(limitValue: unknown, linkedLimit?: UsageLimit): string {
  // Simple, low-complexity renderer: value + unit (from linkedLimit.name or unit) + / period
  const value = (() => {
    if (limitValue === null || limitValue === undefined) return linkedLimit?.defaultValue ?? '';
    if (typeof limitValue === 'number' || typeof limitValue === 'string' || typeof limitValue === 'boolean') return limitValue;
    // object: try common keys
    const obj = limitValue as Record<string, unknown> | undefined;
    if (!obj) return linkedLimit?.defaultValue ?? safePrimitive(limitValue);
    for (const key of ['value', 'amount', 'quantity', 'defaultValue', 'max', 'limit', 'count']) {
      const v = obj[key];
      if (typeof v === 'number' || typeof v === 'string') return v;
    }
    // fallback: any first primitive
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'number' || typeof v === 'string') return v;
    }
    return linkedLimit?.defaultValue ?? safePrimitive(limitValue);
  })();

  let unit = '';
  if (linkedLimit) {
    const lu = linkedLimit as unknown as Record<string, unknown>;
  if (typeof lu.unit === 'string') unit = lu.unit;
  else if (typeof lu.unitOfMeasure === 'string') unit = lu.unitOfMeasure;
    else if (typeof linkedLimit.name === 'string') unit = camelToTitle(linkedLimit.name);
  }

  const period = ((): string => {
    const p = (linkedLimit as unknown as { period?: unknown }).period;
    if (!p) return '';
    if (typeof p === 'string') return p.toLowerCase();
    if (typeof (p as { unit?: unknown }).unit === 'string') return (p as { unit: string }).unit.toLowerCase();
    if (typeof (p as { name?: unknown }).name === 'string') return (p as { name: string }).name.toLowerCase();
    return '';
  })();

  const pieces: string[] = [];
  if (value !== '' && value !== undefined && value !== null) pieces.push(String(value));
  if (unit) pieces.push(unit);
  const main = pieces.join(' ');
  if (period) {
    if (main) return `${main} / ${period}`;
    return period;
  }
  return main;
}

export function FeatureTableV2({ plans, features, usageLimits, addOns }: Readonly<FeatureTableV2Props>) {
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
  return (
    <Box sx={{ overflowX: 'auto', mt: 2 }}>
      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}></TableCell>
            {planKeys.map((planKey, idx) => (
              <TableCell key={planKey} align='center' sx={{ background: getPlanGradient(idx), color: '#fff', fontWeight: "bolder", minWidth: 160, fontSize: 18 }}>
                {plans[planKey].name ?? camelToTitle(planKey)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {featureKeys.map((featureKey, fIdx) => (
            <motion.tr key={featureKey} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + fIdx * 0.02 }}>
              <TableCell component='th' scope='row' sx={{ fontWeight: 600 }}>{camelToTitle(features[featureKey].name) ?? camelToTitle(featureKey)}</TableCell>
              {planKeys.map((planKey) => {
                const plan = plans[planKey];
                const planRaw = plan.features?.[featureKey];
                const rawValue = planRaw.value ?? planRaw.defaultValue;
                const linkedLimit = Object.values(usageLimits ?? {}).find(lim => lim.linkedFeatures?.includes(featureKey));

                // If there's a linked usage limit and a configured limit, show it first
                if (linkedLimit) {
                  const limitVal = plan.usageLimits?.[linkedLimit.name];
                  const effective = limitVal ?? linkedLimit.defaultValue;
                  const hasEffective = effective !== undefined && effective !== null && !(typeof effective === 'string' && effective.trim() === '');
                  if (hasEffective) {
                    return (
                      <TableCell key={planKey} align='center'>
                        <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 2, background: 'linear-gradient(90deg,#34d399,#10b981)', color: '#fff', fontWeight: 700 }}>
                          {formatUsageDisplay(effective, linkedLimit)}
                        </Box>
                      </TableCell>
                    );
                  }
                }

                // If value (or default) is explicitly boolean -> show check
                if (typeof rawValue === 'boolean' && rawValue === true) {
                  return (
                    <TableCell key={planKey} align='center'>
                      <FaCheckCircle style={{ color: '#16a34a', fontSize: '1.25rem' }} />
                    </TableCell>
                  );
                }

                // If value (or default) is a string/number -> render it
                if (typeof rawValue === 'string' || typeof rawValue === 'number') {
                  return (
                    <TableCell key={planKey} align='center'>
                      <Box sx={{ fontWeight: 700 }}>{String(rawValue)}</Box>
                    </TableCell>
                  );
                }

                // If this feature is provided by an add-on available for this plan (even when plan value is false)
                const providedByAddOn = addOnKeys.some(addOnKey => {
                  const ao = addOns?.[addOnKey];
                  if (!ao) return false;
                  // feature must be present in the add-on
                  const provides = ao.features?.[featureKey];
                  if (!provides) return false;
                  // respect dependency-aware availability
                  return isAddOnAvailableForPlan(addOnKey, planKey);
                });

                if (providedByAddOn) {
                  return (
                    <TableCell key={planKey} align='center'>
                      <Box sx={{ color: 'text.secondary' }}>Add-on</Box>
                    </TableCell>
                  );
                }

                // If value (or default) is explicitly boolean and false -> show cross
                if (typeof rawValue === 'boolean' && rawValue === false) {
                  return (
                    <TableCell key={planKey} align='center'>
                      <FaTimesCircle style={{ color: '#9ca3af', fontSize: '1.25rem' }} />
                    </TableCell>
                  );
                }

                // Fallback: cross for unknown/falsy values
                return (
                  <TableCell key={planKey} align='center'>
                    <FaTimesCircle style={{ color: '#9ca3af', fontSize: '1.25rem' }} />
                  </TableCell>
                );
              })}
            </motion.tr>
          ))}
          {/* selection buttons removed for editor: not needed */}
        </TableBody>
      </Table>
    </Box>
  );
}

export default FeatureTableV2;
