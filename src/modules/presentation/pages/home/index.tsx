import { Container } from '@mui/material';
import { flex } from '../../../core/theme/css';
import Logo from '../../../core/components/logo';
import { Helmet } from 'react-helmet';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title> SPHERE - Home </title>
        <meta name="description" content="**SaaS Pricing Holistic Evaluation and Regulation Environment (SPHERE)** is a platform designed to comprehensively evaluate and regulate pricing models in Software as a Service (SaaS). This tool enables the analysis of all aspects of pricing plans, from the operational costs associated with each feature to customer value perception. With a focus on transparency and efficiency, the environment assists pricing designers in optimizing monetization strategies, ensuring regulatory compliance, and aligning offerings with market expectations." />
      </Helmet>

      <Container
        sx={{
          ...flex({ direction: 'column' }),
        }}
      >
        <Logo />
        Welcome
      </Container>
    </>
  );
}
