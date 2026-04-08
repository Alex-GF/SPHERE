import { motion } from 'framer-motion';

const workflowSteps = [
  'Normalize pricing definitions across products',
  'Evaluate plans, features, add-ons, and limits',
  'Simulate pricing changes before release',
  'Deploy updates with DevOps-grade confidence',
];

export default function WorkflowSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 md:grid-cols-[1fr_1fr]"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workflow</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-900">
          Minimal UX.
          <br />
          Powerful pricing operations.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
          Keep your pricing process understandable, collaborative, and fast from modeling to release.
        </p>
      </div>

      <div className="space-y-3">
        {workflowSteps.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sphere-primary-600 text-xs font-bold text-white">
              {index + 1}
            </span>
            <p className="text-sm text-slate-700">{step}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
