import { motion } from 'framer-motion';
import { Plan, PricingFeature } from '../../types';
import { camelToTitle } from '../../utils/helpers';

interface PlansGridProps {
  plans: Record<string, Plan>;
  features: Record<string, PricingFeature>;
  selectedPlan?: string;
  onSelect: (planKey: string) => void;
}

export function PlansGrid({ plans, features, selectedPlan, onSelect }: PlansGridProps) {
  const planKeys = Object.keys(plans);
  const featureKeys = Object.keys(features);
  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch flex-wrap">
      {planKeys.map((planKey, idx) => {
        const plan = plans[planKey];
        return (
          <motion.div
            key={planKey}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring' }}
            className={`flex flex-col w-[260px] rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 cursor-pointer ${
              selectedPlan === planKey
                ? 'border-purple-500 dark:border-yellow-400 scale-105 bg-white dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:scale-105'
            }`}
            onClick={() => onSelect(planKey)}
          >
            <span className="text-xl font-bold text-purple-700 dark:text-yellow-300 mb-2">
              {plan.name ? camelToTitle(plan.name).toUpperCase() : camelToTitle(planKey).toUpperCase()}
            </span>
            <span className="text-3xl font-extrabold text-purple-900 dark:text-yellow-200 mb-2">
              {plan.price}
              <span className="text-base font-normal"> $/month</span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-300 mb-4">
              {plan.description}
            </span>
            <ul className="flex flex-col gap-2 mb-4">
              {featureKeys.map((featureKey) => {
                const feature = features[featureKey];
                const value = plan.features?.[featureKey];
                const enabled = feature.valueType === 'BOOLEAN' ? value === true : !!value;
                return (
                  <li
                    key={featureKey}
                    className={`flex items-center gap-2 text-sm ${
                      enabled
                        ? 'text-green-600 dark:text-yellow-200'
                        : 'text-gray-400 dark:text-gray-500 line-through'
                    }`}
                  >
                    {enabled ? '✔️' : '✖️'} {feature.name ?? camelToTitle(featureKey)}
                  </li>
                );
              })}
            </ul>
            {/* Usage limits */}
            {plan.usageLimits && (
              <div className="text-xs text-gray-400 dark:text-gray-300">
                {Object.entries(plan.usageLimits).map(([limitKey, limitValue]) => (
                  <div key={limitKey}>
                    {camelToTitle(limitKey)}: {String(limitValue)}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
