import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

type ResearchShowcaseSectionProps = {
  onOpenResearch: () => void;
  onOpenTeam: () => void;
};

const images = [
  'assets/landing/research/presenter1.webp',
  'assets/landing/research/presenter3.webp',
  'assets/landing/research/group.webp',
  'assets/landing/research/award.webp',
];

export default function ResearchShowcaseSection({ onOpenResearch, onOpenTeam }: ResearchShowcaseSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Research</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Research-driven pricing innovation</h2>
          <p className="mt-3 max-w-3xl text-sm text-justify leading-relaxed text-slate-600">
            Our platform is the result of cutting-edge research and the dedication of a world-class team. The scientific publications behind our technology and the brilliant minds of our researchers have made it possible to create powerful and flexible solutions for DevOps teams and SaaS pricing management.
            <br />
            <br />
            We invite you to explore the foundation of our success and meet the people who make it all possible.
          </p>
        </div>
        <div className='flex flex-col gap-4'>
          <button
            type="button"
            onClick={onOpenResearch}
            className="inline-flex justify-between items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Read Publications
            <FiArrowRight />
          </button>
          <button
            type="button"
            onClick={onOpenTeam}
            className="inline-flex justify-between items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Meet the team
            <FiArrowRight />
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((imageSrc, index) => (
          <motion.img
            key={imageSrc}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            src={imageSrc}
            alt="SPHERE research highlights"
            className="h-48 w-full rounded-2xl border border-slate-200 object-cover"
          />
        ))}
      </div>
    </motion.section>
  );
}
