import { AddOn } from 'pricing4ts';
import { formatPricingComponentName } from '../../../../services/pricing.service';
import { motion } from 'framer-motion';
import { cardVariants } from '../../shared/motion-variants';
import { indexFromString } from '../../shared/color-palette';
import { formatMoneyDisplay } from '../../shared/value-helpers';

const CIRCLE_BG_CLASSES = [
  'bg-[#5B8CFF]',
  'bg-[#7C5CFF]',
  'bg-[#FF7AB6]',
  'bg-[#FFA657]',
  'bg-[#4BD5BE]',
  'bg-[#FFD36E]',
  'bg-[#6EE7B7]',
  'bg-[#8BD3FF]',
  'bg-[#D6A0FF]',
];

const TITLE_TEXT_CLASSES = [
  'text-[#2754D1]',
  'text-[#5B35D9]',
  'text-[#D94B8D]',
  'text-[#DA7C2F]',
  'text-[#158A77]',
  'text-[#A66D18]',
  'text-[#188C58]',
  'text-[#1E78B1]',
  'text-[#7F4BC0]',
];

export default function AddOnElement({
  addOn,
  currency,
}: Readonly<{
  addOn: AddOn;
  currency: string;
}>): JSX.Element {
  const idx = indexFromString(addOn.name);
  const accentClass = CIRCLE_BG_CLASSES[idx % CIRCLE_BG_CLASSES.length];
  const textClass = TITLE_TEXT_CLASSES[idx % TITLE_TEXT_CLASSES.length];

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.015, boxShadow: '0 8px 20px rgba(15,23,42,0.18)' }}
      className="flex h-[104px] w-[280px] items-center rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-[0_3px_10px_rgba(15,23,42,0.14)]"
    >
      <div className="flex w-full items-center gap-3">
        <div className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-[20px] font-bold text-white ${accentClass}`} aria-hidden>
          {formatPricingComponentName(addOn.name).charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className={`truncate text-[16px] font-extrabold ${textClass}`} title={formatPricingComponentName(addOn.name)}>
            {formatPricingComponentName(addOn.name)}
          </div>
          <div className="truncate text-[12px] w-full text-slate-500" title={addOn.description ?? ''}>
            {addOn.description ?? ''}
          </div>
        </div>

        <div className="min-w-[80px] text-right">
          <div className="text-[20px] font-extrabold leading-none text-slate-900">
            {formatMoneyDisplay(addOn.price)}{typeof addOn.price === 'number' ? currency : ''}
          </div>
          {typeof addOn.price === 'number' && (
            <div className="mt-2 text-[12px] text-slate-700">
              {addOn.unit ? addOn.unit : '/month'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
