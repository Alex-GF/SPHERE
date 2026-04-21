import RevealBlock from './reveal-block';

export default function ProofMarqueeSection({ logos }: { logos: string[] }) {
  return (
    <section className="py-20 md:py-24 lg:py-28">
      <RevealBlock className="rounded-[2rem] border border-black/10 bg-black/[0.03] p-1.5 ring-1 ring-black/5">
        <div className="overflow-hidden rounded-[calc(2rem-0.375rem)] border border-black/10 bg-white py-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.75)]">
          <div className="mb-5 px-6 md:px-8">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#667085]">Trusted by research and product teams</p>
          </div>
          <div className="overflow-hidden">
            <div
              style={{ animation: 'sphere-marquee 24s cubic-bezier(0.32,0.72,0,1) infinite' }}
              className="flex min-w-max gap-3 px-3 will-change-transform"
            >
              {[...logos, ...logos].map((logo, index) => (
                <span
                  key={`${logo}-${index}`}
                  className="rounded-full border border-black/10 bg-[#fcfcfb] px-5 py-2 text-xs uppercase tracking-[0.16em] text-[#475467]"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </RevealBlock>
    </section>
  );
}
