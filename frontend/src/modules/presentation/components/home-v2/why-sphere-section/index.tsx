import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

const bullets = [
  'End-to-end pricing workflows in a single environment',
  'AI-powered pricing analysis and decision support',
  'A suite of tools that tailor to any project',
  'Scalable performance across large pricing configuration spaces',
];

export default function WhySphereSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-200 bg-white p-7 md:p-9"
    >
      <div className="grid gap-7 md:grid-cols-[1fr_0.95fr] md:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Why SPHERE</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            One platform to design, analyze, and deliver pricings
          </h2>
        </div>
        <div className="space-y-2.5">
          {bullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-2.5 text-md text-slate-600">
              <span className="mt-0.5 shrink-0 text-sphere-primary-600">
                <FiCheckCircle />
              </span>
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
