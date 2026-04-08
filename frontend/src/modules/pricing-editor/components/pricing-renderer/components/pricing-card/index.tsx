import { Pricing } from 'pricing4ts';
import { motion } from 'framer-motion';
import { cardVariants } from '../../shared/motion-variants';

export default function PricingCard({
  pricing,
}: Readonly<{
  pricing: Pricing;
}>) {

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <section className="mb-6 rounded-lg border border-slate-300 bg-white px-6 py-8 shadow-[0_4px_10px_rgba(15,23,42,0.12)]">
        <div className="text-center">
          <h1 className="text-[34px] font-extrabold tracking-tight text-slate-900">
            {pricing?.saasName}
          </h1>

          <div className="mt-3 flex flex-wrap justify-center gap-8 text-[14px] text-slate-500">
            <span><span className='font-semibold'>Plans:</span> {Object.values(pricing.plans ?? {}).length}</span>
            <span><span className='font-semibold'>Add-ons:</span> {Object.values(pricing.addOns ?? {}).length || 0}</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}