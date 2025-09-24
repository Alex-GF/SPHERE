import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Plan, AddOn, UsageLimit, PricingFeature } from '../../../types';
import { getPlanColor } from '../PlanColorPalette';
import { camelToTitle } from '../../../utils/helpers';

interface FeatureTableProps {
  plans: Record<string, Plan>;
  features: Record<string, PricingFeature>;
  usageLimits: Record<string, UsageLimit>;
  addOns: Record<string, AddOn>;
  selectedPlan?: string;
  onSelect: (planKey: string) => void;
}

export function FeatureTableCollapsed({ plans, features, usageLimits, addOns, selectedPlan, onSelect }: FeatureTableProps) {
  const planKeys = Object.keys(plans);
  const featureKeys = Object.keys(features);
  const addOnKeys = Object.keys(addOns);
  return (
    <div className="mb-10 flex">
      {/* Feature column (sticky) */}
      <div className="sticky left-0 z-10 bg-purple-200 dark:bg-gray-800 backdrop-blur-md rounded-l-2xl shadow-lg">
        <table className="border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left text-lg font-bold text-purple-700 dark:text-yellow-300 px-4 py-2 bg-transparent min-w-[240px] max-w-[320px]">
                Features
              </th>
            </tr>
          </thead>
          <tbody>
            {featureKeys.map((featureKey) => (
              <tr key={featureKey}>
                <td className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border-l-4 border-purple-200 dark:border-yellow-300 min-w-[240px] max-w-[320px] w-full">
                  {camelToTitle(features[featureKey].name) ?? camelToTitle(featureKey)}
                </td>
              </tr>
            ))}
            {/* Empty cell for plan buttons row */}
            <tr><td className="min-w-[240px] max-w-[320px]"></td></tr>
          </tbody>
        </table>
      </div>
      {/* Scrollable plans columns */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 dark:scrollbar-thumb-yellow-400 dark:scrollbar-track-gray-800 rounded-r-2xl" style={{ maxWidth: 'calc(100vw - 220px)' }}>
        <table className="border-separate border-spacing-y-2">
          <thead>
            <tr>
              {planKeys.map((planKey, idx) => (
                <th
                  key={planKey}
                  className={`text-center text-lg font-bold px-6 py-2 bg-gradient-to-r ${getPlanColor(idx)} text-white shadow w-[240px]`}
                >
                  {plans[planKey].name ? camelToTitle(plans[planKey].name).toUpperCase() : camelToTitle(planKey).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureKeys.map((featureKey, fIdx) => (
              <motion.tr
                key={featureKey}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + fIdx * 0.04 }}
                className="bg-white dark:bg-gray-900/80 hover:bg-purple-50 dark:hover:bg-gray-800/80 transition"
              >
                {planKeys.map((planKey) => {
                  const plan = plans[planKey];
                  const value = plan.features?.[featureKey];
                  const enabled = features[featureKey].valueType === 'BOOLEAN' ? value === true : !!value;
                  const linkedLimit = Object.values(usageLimits).find(lim => lim.linkedFeatures?.includes(featureKey));
                  if (linkedLimit && enabled) {
                    return (
                      <td
                        key={planKey}
                        className="text-center px-6 py-1 min-w-[210px] w-[210px]"
                        style={{ width: 210 }}
                      >
                        <span className="inline-block rounded-full bg-gradient-to-r from-green-400 to-green-600 dark:from-yellow-400 dark:to-yellow-600 px-3 py-1 text-xs font-bold text-white shadow animate-pulse">
                          {plan.usageLimits?.[linkedLimit.name] ?? linkedLimit.defaultValue} / {linkedLimit.period?.unit?.toLowerCase() ?? 'period'}
                        </span>
                      </td>
                    );
                  }
                  if (enabled) {
                    return (
                      <td
                        key={planKey}
                        className="text-center px-6 py-2 min-w-[210px] w-[210px]"
                        style={{ width: 210 }}
                      >
                        <FaCheckCircle className="mx-auto text-green-500 dark:text-yellow-300 animate-pop" size={20} />
                      </td>
                    );
                  }
                  if (
                    addOnKeys.some(
                      addOnKey =>
                        addOns[addOnKey].features?.[featureKey] &&
                        (!addOns[addOnKey].availableFor || addOns[addOnKey].availableFor?.includes(planKey))
                    )
                  ) {
                    return (
                      <td
                        key={planKey}
                        className="text-center px-6 py-2 min-w-[210px] w-[210px]"
                        style={{ width: 210 }}
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-300">Add-on</span>
                      </td>
                    );
                  }
                  return (
                    <td
                      key={planKey}
                      className="text-center px-6 py-2 min-w-[210px] w-[210px]"
                      style={{ width: 210 }}
                    >
                      <FaTimesCircle className="mx-auto text-gray-300 dark:text-gray-600" size={20} />
                    </td>
                  );
                })}
              </motion.tr>
            ))}
            {/* Plan select buttons row */}
            <tr>
              {planKeys.map((planKey, idx) => (
                <td key={planKey} className="text-center py-4">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onSelect(planKey)}
                    className={`w-full px-4 py-2 font-bold shadow transition text-white text-base bg-gradient-to-r ${getPlanColor(idx)}`}
                    aria-label={`Select ${plans[planKey].name ? camelToTitle(plans[planKey].name).toUpperCase() : camelToTitle(planKey).toUpperCase()} plan`}
                    style={{ minWidth: 210, width: 210 }}
                  >
                    {selectedPlan === planKey ? 'Current Plan' : `Select ${plans[planKey].name ? camelToTitle(plans[planKey].name).toUpperCase() : camelToTitle(planKey).toUpperCase()}`}
                  </motion.button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
