import { useState } from 'react';
import { Contribution, contributions } from './data/contributions-data';
import ContributionCard from '../../layouts/components/contribution-card';
import { Helmet } from 'react-helmet';
import { Box, styled } from '@mui/material';
import ContributionDetailsModal from '../../layouts/components/contribution-details';

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
  const [open, setOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  const handleOpen = (contribution: any) => {
    setSelectedContribution(contribution);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedContribution(null);
  };

  return (
    <>
      <Helmet>
        <title> SPHERE - Contributions </title>
      </Helmet>
      <ContributionsGrid>
        {contributions.map((contribution, index) => (
          <ContributionCard 
            key={index} 
            onClick={() => handleOpen(contribution)} 
            contribution={contribution} 
          />
        ))}
      </ContributionsGrid>

      <ContributionDetailsModal selectedContribution={selectedContribution} isOpen={open} handleClose={handleClose}/>
    </>
  );
}
