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
  return (
    <Box sx={{ overflowX: 'auto', mt: 2 }}>
      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}></TableCell>
            {planKeys.map((planKey, idx) => (
              <TableCell key={planKey} align='center' sx={{ background: getPlanGradient(idx), color: '#fff', fontWeight: "bolder", minWidth: 160, fontSize: 18 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 20 }}>{camelToTitle(plans[planKey].name) ?? camelToTitle(planKey)}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 24 }}>{plans[planKey].price === 0 ? 'FREE' : <>{plans[planKey].price}{typeof plans[planKey].price === 'number' ? (currency ?? '') : ''}</>}</Typography>
                {typeof plans[planKey].unit === 'string' && (
                  <Typography variant='caption' sx={{ fontSize: 14 }}>{plans[planKey].unit}</Typography>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {featureKeys.map((featureKey, fIdx) => (
            <motion.tr key={featureKey} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + fIdx * 0.02 }}>
              <TableCell component='th' scope='row' sx={{ fontWeight: 600, fontSize: 16 }}>{camelToTitle(features[featureKey].name) ?? camelToTitle(featureKey)}</TableCell>
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
