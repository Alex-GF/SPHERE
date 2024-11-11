import { contributions } from './data/contributions-data';
import ContributionCard from '../../layouts/presentation-layout/components/contribution-card';
import { Helmet } from 'react-helmet';
import { Box, styled } from '@mui/material';

const ContributionsGrid = styled(Box)(() => ({
  width: '100dvw',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-evenly',
  gap: '1rem',
  margin: 'auto',
  padding: '50px 15px 15px 20px',
}));

export default function ContributionsPage() {
  return (
    <>
      <Helmet>
        <title> SPHERE - Contributions </title>
      </Helmet>
      <ContributionsGrid>
        {contributions.map((contribution, index) => (
          <ContributionCard key={index} contribution={contribution} />
        ))}
      </ContributionsGrid>
    </>
  );
}
