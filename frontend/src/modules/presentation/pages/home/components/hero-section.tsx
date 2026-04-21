import RevealBlock from './reveal-block';
import IslandButton from './island-button';

export default function HeroSection({ onRegister, onPricings }: { onRegister: () => void; onPricings: () => void }) {
  return (
    <section className="py-24 md:py-32">
      <RevealBlock className="mb-8">
        <span className="inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#475467]">
          Pricing Intelligence OS
        </span>
      </RevealBlock>

      <RevealBlock className="max-w-4xl" delay={120}>
        <h1 className="[font-family:'Clash_Display','Geist',sans-serif] text-[2.35rem] font-medium leading-[0.95] text-[#111827] md:text-[4.9rem] lg:text-[5.8rem]">
          Model every pricing decision before it reaches production.
        </h1>
      </RevealBlock>

      <RevealBlock className="mt-8 max-w-2xl" delay={220}>
        <p className="text-base leading-relaxed text-[#475467] md:text-lg">
          SPHERE unifies plan design, experiment simulation, and monetization analytics so growth, product, and engineering teams ship pricing updates with fewer blind spots.
        </p>
      </RevealBlock>

      <RevealBlock className="mt-10 flex flex-wrap items-center gap-4" delay={300}>
        <IslandButton label="Launch workspace" onClick={onRegister} />
        <IslandButton label="Explore pricings" onClick={onPricings} />
      </RevealBlock>
    </section>
  );
}
