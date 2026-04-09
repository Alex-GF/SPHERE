import { Helmet } from 'react-helmet';
import { useRouter } from '../../../core/hooks/useRouter';
import MinimalHeroSection from '../../components/home-v2/minimal-hero-section';
import WhySphereSection from '../../components/home-v2/why-sphere-section';
import ToolsCatalogSection from '../../components/home-v2/tools-catalog-section';
import ResearchShowcaseSection from '../../components/home-v2/research-showcase-section';
import FoundingPartnersSection from '../../components/home-v2/founding-partners-section';
import FinalCtaSection from '../../components/home-v2/final-cta-section';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Helmet>
        <title>SPHERE | SaaS Pricing Platform for DevOps Teams</title>
        <meta
          name="description"
          content="SPHERE is a SaaS pricing and DevOps platform to model, evaluate, and optimize pricing strategies. Explore configuration spaces, analyze monetization, and ship pricing changes with confidence."
        />
        <meta
          name="keywords"
          content="pricing, SaaS pricing, DevOps, pricing optimization, monetization, pricing analytics, configuration space"
        />
      </Helmet>
      <div className="relative min-h-screen w-full overflow-hidden bg-[#eff5fb] text-slate-900 [font-family:'Space_Grotesk',sans-serif]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-36 top-8 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute right-[-120px] top-28 h-96 w-96 rounded-full bg-blue-200/35 blur-3xl" />
          <div className="absolute top-[45%] left-1/3 h-72 w-72 rounded-full bg-sky-100/70 blur-3xl" />
          <div className="absolute bottom-[-120px] right-1/4 h-96 w-96 rounded-full bg-cyan-100/60 blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.1),_transparent_42%)]" />

        <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-24 px-6 pb-24 md:px-10">
          <MinimalHeroSection
            onStart={() => router.push('/register')}
            onExplore={() => router.push('/pricings')}
          />

          <WhySphereSection />

          <ToolsCatalogSection />

          <ResearchShowcaseSection onOpenResearch={() => router.push('/research')} onOpenTeam={() => router.push('/team')} />

          <FoundingPartnersSection />

          <FinalCtaSection onCreateAccount={() => router.push('/register')} />
        </main>
      </div>
    </>
  );
}

