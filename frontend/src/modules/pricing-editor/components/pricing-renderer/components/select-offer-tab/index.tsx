import { BilledType, RenderingStyles } from '../../types';
import DEFAULT_RENDERING_STYLES from '../../shared/constants';
import { motion } from 'framer-motion';
import { cardVariants } from '../../shared/motion-variants';

export default function SelectOfferTab({
  selectedBilledType,
  handleSwitchTab,
  style,
}: Readonly<{
  selectedBilledType: BilledType;
  handleSwitchTab: (tab: BilledType) => void;
  style: RenderingStyles;
}>): JSX.Element {
  const activeClasses = 'bg-sky-600 text-white shadow-sm';
  const idleClasses = 'border border-slate-300 text-slate-700 hover:bg-slate-50';

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <div className="flex justify-center p-1">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleSwitchTab('monthly')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${selectedBilledType === 'monthly' ? activeClasses : idleClasses}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('annually')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${selectedBilledType === 'annually' ? activeClasses : idleClasses}`}
          >
            Annually
          </button>
        </div>
      </div>
    </motion.div>
  );
}
