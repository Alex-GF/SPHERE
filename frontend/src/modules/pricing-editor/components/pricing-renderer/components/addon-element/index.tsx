import { AddOn } from 'pricing4ts';
import { RenderingStyles } from '../../types';
import DEFAULT_RENDERING_STYLES from '../../shared/constants';
import { formatPricingComponentName } from '../../../../services/pricing.service';
import { motion } from 'framer-motion';
import { cardVariants } from '../../shared/motion-variants';
import { indexFromString } from '../../shared/color-palette';
import { formatMoneyDisplay } from '../../shared/value-helpers';

const ACCENT_CLASSES = [
  'bg-sky-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
];

const TEXT_CLASSES = [
  'text-sky-700',
  'text-emerald-700',
  'text-violet-700',
  'text-amber-700',
  'text-rose-700',
  'text-cyan-700',
];

export default function AddOnElement({
  addOn,
  currency,
  style,
}: Readonly<{
  addOn: AddOn;
  currency: string;
  style: RenderingStyles;
}>): JSX.Element {
  const idx = indexFromString(addOn.name);
  const accentClass = ACCENT_CLASSES[idx % ACCENT_CLASSES.length];
  const textClass = TEXT_CLASSES[idx % TEXT_CLASSES.length];

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}
      className="m-2 flex h-[104px] w-[280px] items-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex w-full items-center gap-3">
        <div className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full font-bold text-white ${accentClass}`} aria-hidden>
          {formatPricingComponentName(addOn.name).charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className={`truncate font-semibold ${textClass}`} title={formatPricingComponentName(addOn.name)}>
            {formatPricingComponentName(addOn.name)}
          </div>
          <div className="truncate text-xs text-slate-500" title={addOn.description ?? ''}>
            {addOn.description ?? ''}
          </div>
        </div>

        <div className="min-w-[80px] text-right">
          <div className="text-lg font-bold text-slate-900">
            {formatMoneyDisplay(addOn.price)}{typeof addOn.price === 'number' ? currency : ''}
          </div>
          {typeof addOn.price === 'number' && (
            <div className="text-xs text-slate-500">
              {addOn.unit ? addOn.unit : '/month'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
