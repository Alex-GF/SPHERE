import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { usePricingsApi } from '../../../pricing/api/pricingsApi';
import { PricingEntry } from '../../../pricing/pages/list';
import PricingListCard from '../../../pricing/components/pricing-list-card';

export default function PricingSection({setAddToCollectionModalOpen, setPricingToAdd}: {setAddToCollectionModalOpen: (value: boolean) => void, setPricingToAdd: (value: string) => void}) {
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
      {pricings && pricings.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Unassigned {pricings.length > 0 && `(${pricings.length})`}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              marginTop: '30px',
            }}
          >
            {pricings.map((pricing: PricingEntry) => (
              <PricingListCard
                name={pricing.name}
                owner={pricing.owner}
                dataEntry={pricing}
                showOptions
                setPricingToAdd={setPricingToAdd}
                setAddToCollectionModalOpen={setAddToCollectionModalOpen}
                key={`pricing-${pricing.name}`}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
