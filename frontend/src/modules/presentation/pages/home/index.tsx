import { Helmet } from 'react-helmet';
import HeroLanding from '../../components/hero-landing';
import BulletsLanding from '../../components/bullets-landing';
import ToolsLanding from '../../components/tools-landing';
import StatsLanding from '../../components/stats-landing';
import ResearchLanding from '../../components/research-landing';
import FeaturesLanding from '../../components/features-landing';
import FoundingLanding from '../../components/founding-landing';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title> SPHERE - Home </title>
        <meta
          name="description"
          content="**SaaS Pricing Holistic Evaluation and Regulation Environment (SPHERE)** is a platform designed to comprehensively evaluate and regulate pricing models in Software as a Service (SaaS). This tool enables the analysis of all aspects of pricing plans, from the operational costs associated with each feature to customer value perception. With a focus on transparency and efficiency, the environment assists pricing designers in optimizing monetization strategies, ensuring regulatory compliance, and aligning offerings with market expectations."
        />
      </Helmet>
      <div className="flex w-dvw flex-col">
        <HeroLanding />
        <div className="w-dvw border-b border-slate-200" />
        <FeaturesLanding />
        <div className="w-dvw border-b border-slate-200" />
        <StatsLanding />
        <div className="w-dvw border-b border-slate-200" />
        <ToolsLanding />
        <div className="w-dvw border-b border-slate-200" />
        <BulletsLanding />
        {/* <Divider sx={{ width: '100dvw' }} />
        <SimplificationLanding /> */}
        <div className="w-dvw border-b border-slate-200" />
        <ResearchLanding />
        <div className="w-dvw border-b border-slate-200" />
        <FoundingLanding />
        {/* <Divider sx={{ width: '100dvw' }} />
        <FinalLanding /> */}
      </div>
    </>
  );
}

