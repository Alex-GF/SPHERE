import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay } from 'react-icons/fi';

type MinimalHeroSectionProps = {
  onStart: () => void;
  onExplore: () => void;
};

export default function MinimalHeroSection({ onStart, onExplore }: MinimalHeroSectionProps) {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden text-slate-900">
      <div className="absolute inset-0 rounded-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex h-full w-full items-center justify-center px-6 py-10 md:px-10 md:py-12"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className="max-w-5xl text-[3.2rem] font-semibold leading-[0.9] tracking-[-0.03em] text-slate-900 md:text-[5.8rem]"
          >
            Powering
            <br />
            <span className="italic text-cyan-600">pricing-driven DevOps</span>
            <br />
            for SaaS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-700 md:text-xl"
          >
            Analyze pricings, explore their configuration space, and release changes with a single click
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Start Free
              <FiArrowRight />
            </button>
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex items-center gap-2 rounded-full border border-slate-400 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Explore Pricings
              <FiPlay className="text-xs" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
