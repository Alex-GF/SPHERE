import { motion } from 'framer-motion';
import { AddOn } from '../../types';
import { camelToTitle } from '../../utils/helpers';

interface AddOnsGridProps {
  addOns: Record<string, AddOn>;
  selectedAddOns: Record<string, number>;
  selectedPlan?: string;
  onChange: (addonKey: string, value: number) => void;
}

export function AddOnsGrid({ addOns, selectedAddOns, selectedPlan, onChange }: AddOnsGridProps) {
  const addOnKeys = Object.keys(addOns);
  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch flex-wrap">
      {addOnKeys.map((addonKey, idx) => {
        const addon = addOns[addonKey];
        const isScalable = !!addon.usageLimitsExtensions && Object.keys(addon.usageLimitsExtensions).length > 0;
        const quantity = selectedAddOns[addonKey] || 0;
        const available = !addon.availableFor || !selectedPlan || addon.availableFor.includes(selectedPlan);
        return (
          <motion.div
            key={addonKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring' }}
            className={`flex flex-col w-[260px] rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 ${
              available
                ? 'border-purple-400 dark:border-yellow-400 bg-white dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 opacity-60 pointer-events-none'
            }`}
          >
            <span className="text-lg font-bold text-purple-700 dark:text-yellow-300 mb-1">
              {camelToTitle(addon.name) ?? camelToTitle(addonKey)}
            </span>
            <span className="text-2xl font-extrabold text-purple-900 dark:text-yellow-200 mb-1">
              {addon.price}
              <span className="text-base font-normal"> $/month</span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-300 mb-4">
              {addon.description}
            </span>
            {isScalable ? (
              <div className="flex items-center gap-2 mt-auto">
                <span className="text-xs text-gray-400 dark:text-gray-300">Quantity:</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={quantity}
                  onChange={e =>
                    onChange(
                      addonKey,
                      Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
                    )
                  }
                  className="w-16 rounded-lg border dark:bg-gray-900 border-purple-300 dark:border-yellow-400 px-2 py-1 text-center text-lg font-bold text-purple-700 dark:text-yellow-200 focus:border-purple-500 focus:outline-none transition"
                />
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`mt-auto rounded-lg px-4 py-2 font-bold shadow transition ${
                  quantity
                    ? 'bg-purple-500 dark:bg-yellow-400 text-white dark:text-yellow-900'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
                onClick={() => onChange(addonKey, quantity ? 0 : 1)}
                disabled={!available}
              >
                {quantity ? 'Remove' : 'Add'}
              </motion.button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
