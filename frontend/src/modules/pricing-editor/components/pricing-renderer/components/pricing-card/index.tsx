import { Pricing } from 'pricing4ts';
import { RenderingStyles } from '../../types';
import { motion } from 'framer-motion';
import { cardVariants } from '../../shared/motion-variants';

export default function PricingCard({
  pricing,
  style,
  defaultStyle,
}: Readonly<{
  pricing: Pricing;
  style: RenderingStyles;
  defaultStyle: RenderingStyles;
}>) {

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-sky-700">
            {pricing?.saasName}
          </h1>

          <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm text-slate-600">
            <span><strong>Plans:</strong> {Object.values(pricing.plans ?? {}).length}</span>
            <span><strong>Add-ons:</strong> {Object.values(pricing.addOns ?? {}).length || 0}</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}