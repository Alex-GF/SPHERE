import RevealBlock from './reveal-block';
import IslandButton from './island-button';

export default function HeroSection({ onRegister, onPricings }: { onRegister: () => void; onPricings: () => void }) {
  return (
    <section className="py-24 md:py-32">
      <RevealBlock className="mb-8">
        <span className="inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#475467]">
          Pricing Intelligence Ecosystem
        </span>
      </RevealBlock>

      <RevealBlock className="max-w-4xl" delay={120}>
        <h1 className="[font-family:'Clash_Display','Geist',sans-serif] text-[2.35rem] font-semibold leading-[0.9] text-[#111827] md:text-[4.9rem] lg:text-[5.8rem]">
          <span className="block">Design</span>
          <span className="block text-[#334155]">Ship</span>
          <span className="relative block w-fit">
            <span className="bg-[length:200%_200%] bg-[linear-gradient(100deg,#0f172a_0%,#2563eb_45%,#10b981_100%)] bg-clip-text text-transparent [animation:hero-gradient-shift_6.8s_cubic-bezier(0.32,0.72,0,1)_infinite]">
              Repeat
            </span>
          </span>
        </h1>
      </RevealBlock>

      <RevealBlock className="mt-8 max-w-2xl" delay={220}>
        <p className="text-base leading-relaxed text-[#475467] md:text-lg">
          SPHERE unifies pricing design, simulation, and analysis so growth, product, and engineering teams ship pricing updates with no blind spots.
        </p>
      </RevealBlock>

      <RevealBlock className="mt-10 flex flex-wrap items-center gap-4" delay={300}>
        <IslandButton label="Start for Free" onClick={onRegister} />
        <IslandButton label="Explore Product" onClick={onPricings} outlined/>
      </RevealBlock>
    </section>
  );
}
