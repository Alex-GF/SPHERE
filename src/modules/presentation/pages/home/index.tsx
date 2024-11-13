import { flex } from '../../../core/theme/css';
import { Helmet } from 'react-helmet';
import { Box } from '@mui/system';
import { Divider } from '@mui/material';
import HeroLanding from '../../layouts/presentation-layout/components/hero-landing';
import BulletsLanding from '../../layouts/presentation-layout/components/bullets-landing';
import ToolsLanding from '../../layouts/presentation-layout/components/tools-landing';
import SimplificationLanding from '../../layouts/presentation-layout/components/simplification-landing';
import StatsLanding from '../../layouts/presentation-layout/components/stats-landing';
import ResearchLanding from '../../layouts/presentation-layout/components/research-landing';
import FinalLanding from '../../layouts/presentation-layout/components/final-landing';
import FeaturesLanding from '../../layouts/presentation-layout/components/features-landing';
import FoundingLanding from '../../layouts/presentation-layout/components/founding-landing';

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
      <Box sx={{ width: '100dvw', ...flex({ direction: 'column' }) }}>
        <HeroLanding />
        <Divider sx={{ width: '100dvw' }} />      
        <FeaturesLanding />
        <Divider sx={{ width: '100dvw' }} />
        <StatsLanding />
        <Divider sx={{ width: '100dvw' }} />
        <ToolsLanding />
        <Divider sx={{ width: '100dvw' }} />
        <BulletsLanding />
        {/* <Divider sx={{ width: '100dvw' }} />
        <SimplificationLanding /> */}
        <Divider sx={{ width: '100dvw' }} />
        <ResearchLanding />
        <Divider sx={{ width: '100dvw' }} />
        <FoundingLanding />
        {/* <Divider sx={{ width: '100dvw' }} />
        <FinalLanding /> */}
      </Box>
    </>
  );
}

