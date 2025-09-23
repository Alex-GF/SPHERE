import { motion } from 'framer-motion';
import { Plan, AddOn, UsageLimit, PricingFeature } from '../../../types';
import { camelToTitle } from '../../../utils/helpers';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getPlanColor } from '../PlanColorPalette';

interface FeatureTableProps {
  plans: Record<string, Plan>;
  features: Record<string, PricingFeature>;
  usageLimits: Record<string, UsageLimit>;
  addOns: Record<string, AddOn>;
  selectedPlan?: string;
  onSelect: (planKey: string) => void;
}

export function FeatureTableSimple({ plans, features, usageLimits, addOns, selectedPlan, onSelect }: FeatureTableProps) {
  const planKeys = Object.keys(plans);
  const featureKeys = Object.keys(features);
  const addOnKeys = Object.keys(addOns);
  return (
    <div className="mb-10">
      <table className="min-w-[600px] w-full border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th className="text-left text-lg font-bold text-purple-700 dark:text-yellow-300 px-4 py-2 bg-transparent">
              Feature
            </th>
            {planKeys.map((planKey, idx) => (
              <th
                key={planKey}
                className={`text-center text-lg font-bold px-6 py-2 bg-gradient-to-r ${getPlanColor(idx)} text-white shadow min-w-[210px] w-[210px]`}
                style={{ width: 160 }}
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
              <td className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-210 border-l-4 border-purple-210 dark:border-yellow-300">
                {features[featureKey].name ?? camelToTitle(featureKey)}
              </td>
              {planKeys.map(planKey => {
                const plan = plans[planKey];
                const value = plan.features?.[featureKey];
                const enabled = features[featureKey].valueType === 'BOOLEAN' ? value === true : !!value;
                // Si la feature está vinculada a un usage limit y está activa, mostrar el límite
                const linkedLimit = Object.values(usageLimits).find(lim => lim.linkedFeatures?.includes(featureKey));
                if (linkedLimit && enabled) {
                  return (
                    <td
                      key={planKey}
                      className="text-center px-6 py-2 min-w-[210px] w-[210px]"
                      style={{ width: 160 }}
                    >
                      <span className="inline-block rounded-full bg-gradient-to-r from-green-400 to-green-600 dark:from-yellow-400 dark:to-yellow-600 px-3 py-1 text-xs font-bold text-white shadow animate-pulse">
                        {plan.usageLimits?.[linkedLimit.name] ?? linkedLimit.defaultValue} / {linkedLimit.period?.unit?.toLowerCase() ?? 'period'}
                      </span>
                    </td>
                  );
                }
                // Si la feature está incluida
                if (enabled) {
                  return (
                    <td
                      key={planKey}
                      className="text-center px-6 py-2 min-w-[210px] w-[210px]"
                      style={{ width: 160 }}
                    >
                      <FaCheckCircle className="mx-auto text-green-500 dark:text-yellow-300 animate-pop" size={20} />
                    </td>
                  );
                }
                // Si la feature es un add-on exclusivo de un plan
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
                      style={{ width: 160 }}
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-300">Add-on</span>
                    </td>
                  );
                }
                // Si no está incluida
                return (
                  <td
                    key={planKey}
                    className="text-center px-6 py-2 min-w-[210px] w-[210px]"
                    style={{ width: 160 }}
                  >
                    <FaTimesCircle className="mx-auto text-gray-300 dark:text-gray-600" size={20} />
                  </td>
                );
              })}
            </motion.tr>
          ))}
          {/* Fila de botones de selección de plan */}
          <tr>
            <td></td>
            {planKeys.map((planKey, idx) => (
              <td key={planKey} className="text-center py-4">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelect(planKey)}
                  className={`w-full px-4 py-2 font-bold shadow transition text-white text-base bg-gradient-to-r ${getPlanColor(idx)}`}
                  aria-label={`Select ${plans[planKey].name ? camelToTitle(plans[planKey].name).toUpperCase() : camelToTitle(planKey).toUpperCase()} plan`}
                >
                  {selectedPlan === planKey ? 'Current Plan' : `Select ${plans[planKey].name ? camelToTitle(plans[planKey].name).toUpperCase() : camelToTitle(planKey).toUpperCase()}`}
                </motion.button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}