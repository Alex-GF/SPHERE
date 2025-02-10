import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { usePricingsApi } from '../../../pricing/api/pricingsApi';
import { PricingEntry } from '../../../pricing/pages/list';
import PricingListCard from '../../../pricing/components/pricing-list-card';

export default function PricingSection() {
  const [pricings, setPricings] = useState([]);

  const { getLoggedUserPricings } = usePricingsApi();

  useEffect(() => {
    getLoggedUserPricings()
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        } else if (data.pricings) {
          setPricings(data.pricings.pricings);
        }
      })
      .catch(error => {
        console.log('Cannot GET pricings. Error:', error);
      });
  }, []);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Pricings {pricings.length > 0 && `(${pricings.length})`}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          marginTop: "30px"
        }}
      >
        {pricings && pricings.length > 0 ? (
          pricings.map((pricing: PricingEntry) => (
            <PricingListCard name={pricing.name} owner={pricing.owner} dataEntry= {pricing} key={`pricing-${pricing.name}`}/>
          ))
        ) : (
          <Box sx={{ marginTop: '20px' }}>You have no pricings</Box>
        )}
      </Box>
    </Box>
  );
}
