import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

type FinalCtaSectionProps = {
  onCreateAccount: () => void;
};

export default function FinalCtaSection({ onCreateAccount }: FinalCtaSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-200 bg-[#0f172a] p-8 text-white md:p-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-200">SPHERE Platform</p>
          <h2 className="mt-2 text-3xl font-semibold">Ready to optimize pricing decisions at scale?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            Join teams using SPHERE to improve pricing strategy, accelerate DevOps cycles, and ship better SaaS outcomes.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateAccount}
          className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Create Account
          <FiArrowRight />
        </button>
      </div>
    </motion.section>
  );
}
