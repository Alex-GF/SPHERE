import { Plan } from 'pricing4ts';
import { motion } from 'framer-motion';
import { listItemVariants } from '../../shared/motion-variants';

const HEADER_CLASSES = [
  'from-sky-500 to-sky-700',
  'from-emerald-500 to-emerald-700',
  'from-violet-500 to-violet-700',
  'from-amber-500 to-amber-700',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
];

const TEXT_CLASSES = [
  'text-sky-700',
  'text-emerald-700',
  'text-violet-700',
  'text-amber-700',
  'text-rose-700',
  'text-cyan-700',
];

export default function PlanHeader({
  plan,
  currency,
  // support optional index to pick color
  index,
}: Readonly<{
  plan: Plan;
  currency: string;
  index?: number;
}>): JSX.Element {
  const gradientClass = typeof index === 'number' ? HEADER_CLASSES[index % HEADER_CLASSES.length] : HEADER_CLASSES[0];
  const textClass = typeof index === 'number' ? TEXT_CLASSES[index % TEXT_CLASSES.length] : TEXT_CLASSES[0];

  return (
    <motion.th
      variants={listItemVariants}
      custom={index ?? 0}
      scope="col"
      className={`px-1 text-center align-top text-white bg-linear-to-br ${gradientClass}`}
    >
      <div className="space-y-1 py-4">
        <div className={`text-lg font-semibold ${textClass} text-white`}>
          {plan.name}
        </div>

        <div className="text-2xl font-bold text-white">
          {plan.price === 0 ? 'FREE' : <>{plan.price}{typeof plan.price === 'number' ? currency : ''}</>}
        </div>
        {typeof plan.price === 'number' && (
          <div className="text-xs opacity-90 text-white">
            {plan.unit ? plan.unit : '/month'}
          </div>
        )}
      </div>
    </motion.th>
  );
}