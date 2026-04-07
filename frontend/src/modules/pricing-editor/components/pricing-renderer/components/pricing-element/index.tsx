import { pluralizeUnit } from '../../../../services/pricing.service';
import { formatPricingValue } from '../../shared/value-helpers';
import { RiErrorWarningFill } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { listItemVariants } from '../../shared/motion-variants';

export default function PricingElement({
  name,
  values,
}: Readonly<{
  name: string;
  values: {
    value: string | number | boolean;
    unit?: string;
    addonName: string | null;
    addonValue: string | number | boolean | null;
    addonExtension: boolean;
  }[];
}>): JSX.Element {
  return (
    <tr>
      <th scope="row" className="border-t border-slate-200 px-2 py-3 text-left align-middle">
        <div className="text-base font-semibold text-slate-900">
          {name}
        </div>
      </th>
      {values.map(({ value, unit, addonName, addonValue, addonExtension }, key) => {
        const toneClass = key % 2 === 0 ? 'bg-slate-50' : 'bg-slate-100';

        // Build content for boolean cells without nested ternaries
        if (typeof value === 'boolean') {
          let content: JSX.Element | string;
          if (value) {
            content = (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-label="Included" className="h-5 w-5 text-emerald-600">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            );
          } else if (addonValue) {
            content = <span className="text-sm">Add-on</span>;
          } else {
            content = (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-label="Not included" className="h-[18px] w-[18px] text-slate-400">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
              </svg>
            );
          }

          return (
            <td key={`${name}-${key}`} className={`border-t border-slate-200 px-2 py-3 text-center align-middle ${toneClass}`}>
              <motion.div variants={listItemVariants} custom={key} className="flex items-center justify-center">
                {content}
              </motion.div>
            </td>
          );
        }

        // Non-boolean (string or number) cells
        const formatted = formatPricingValue(value as unknown as string | number, unit, typeof addonValue === 'number' ? addonValue : null, addonExtension);
        const showTooltip = typeof value === 'number' && typeof addonValue === 'number' && (((!addonExtension && addonValue > value) || addonExtension) && addonValue > 0);

        let addonUnit = '';
        if (typeof addonValue === 'number') {
          addonUnit = addonValue > 1 ? pluralizeUnit(unit ?? '') : (unit ?? '');
        }
        const tooltipText = addonExtension
          ? `You can contract ${addonValue} more ${addonUnit} by contracting the add-on '${addonName!}'`
          : `You can extend this limit up to ${addonValue} ${addonUnit} by contracting the add-on '${addonName!}'`;

        return (
          <td key={`${name}-${key}`} className={`border-t border-slate-200 px-2 py-3 text-center align-middle ${toneClass}`}>
            <motion.div variants={listItemVariants} custom={key} className="flex justify-center">
              <span className="text-sm text-slate-700">
                {formatted}
                {showTooltip ? (
                  <span title={tooltipText} className="ml-1 inline-flex align-middle">
                      <RiErrorWarningFill />
                  </span>
                ) : null}
              </span>
            </motion.div>
          </td>
        );
      })}
    </tr>
  );
}
