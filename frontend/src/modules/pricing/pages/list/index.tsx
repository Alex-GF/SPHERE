import { Box, styled } from '@mui/material';
import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import PricingListCard from '../../components/pricing-list-card';
import { usePricingsApi } from '../../api/pricingsApi';

const PricingsGrid = styled(Box)(() => ({
  maxWidth: '2000px',
  width: '100dvw',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-evenly',
  gap: '5rem',
  margin: 'auto',
  padding: '50px 15px 15px 20px',
}));

export type PricingEntry = {
  name: string;
  extractionDate: Date;
  yaml: string;
  publicAnalytics: {
    configurationSpaceSize: number;
    minSubscriptionPrice: number;
    maxSubscriptionPrice: number;
  };
};

export default function PricingListPage() {
  const [pricingsList, setPricingsList] = useState<PricingEntry[]>([]);

  const { getPricings } = usePricingsApi();

  useEffect(() => {
    getPricings()
      .then(data => {
        console.log(data);
        setPricingsList(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title> SPHERE - Pricings </title>
      </Helmet>
      <PricingsGrid>
        {Object.values(pricingsList).map((pricing, index) => {
          return <PricingListCard key={`pricing-${index}`} name={pricing.name} dataEntry={pricing} />;
        })}
      </PricingsGrid>
    </>
  );
}
