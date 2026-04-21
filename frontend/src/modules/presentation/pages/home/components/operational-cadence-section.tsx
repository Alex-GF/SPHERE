import RevealBlock from './reveal-block';

const STEPS = [
  {
    title: 'Plan Intelligence',
    description: 'Track feature-to-revenue coupling as packaging evolves across releases.',
  },
  {
    title: 'Experiment Surface',
    description: 'Compare candidate pricing states against retention and expansion assumptions.',
  },
  {
    title: 'Release Control',
    description: 'Ship approved variants to APIs and docs from one governed source of truth.',
  },
];

export default function OperationalCadenceSection() {
  return (
    <section id="operational-cadence" className="py-20 md:py-28 lg:py-32">
      <RevealBlock className="mb-8">
        <span className="inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#475467]">
          Operational Cadence
        </span>
      </RevealBlock>

      <div className="flex w-full flex-col gap-10 md:flex-row md:items-start md:gap-14">
        <RevealBlock className="w-full md:w-1/2" delay={90}>
          <h2 className="[font-family:'Clash_Display','Geist',sans-serif] text-4xl font-medium leading-[0.95] text-[#111827] md:text-6xl">
            One loop for product, growth, and infra.
          </h2>
          <p className="mt-7 max-w-xl text-sm leading-relaxed text-[#475467] md:text-base">
            Replace disconnected docs and ad-hoc spreadsheets with a controlled loop: structure plans, pressure-test assumptions, and release with policy-aware confidence.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {['Policy snapshots', 'Experiment logs', 'Version lineage', 'Rollback-safe exports'].map(item => (
              <span
                key={item}
                className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-[#475467]"
              >
                {item}
              </span>
            ))}
          </div>
        </RevealBlock>

        <RevealBlock className="w-full md:w-1/2" delay={170}>
          <div className="flex flex-col gap-5">
            {STEPS.map((step, index) => (
              <article key={step.title} className="rounded-[2rem] border border-black/10 bg-black/[0.03] p-1.5 ring-1 ring-black/5">
                <div className="group relative overflow-hidden rounded-[calc(2rem-0.375rem)] border border-black/10 bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.75)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 md:p-8">
                  <div className="pointer-events-none absolute -right-5 -top-8 text-[6.4rem] font-medium leading-none text-[#e5e7eb] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                    {`0${index + 1}`}
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#667085]">Step {`0${index + 1}`}</p>
                  <h3 className="mt-2 text-2xl font-medium leading-tight text-[#111827]">{step.title}</h3>
                  <p className="mt-3 max-w-[34rem] text-sm leading-relaxed text-[#475467] md:text-base">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}
