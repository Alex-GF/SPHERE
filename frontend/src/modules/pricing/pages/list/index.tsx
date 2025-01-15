import { Box, styled } from '@mui/material';
import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import PricingListCard from '../../components/pricing-list-card';
import { usePricingsApi } from '../../api/pricingsApi';
import SearchBar from '../../components/search-bar';
import { flex } from '../../../core/theme/css';
import PricingFilters from '../../components/pricing-filters';
import { grey } from '../../../core/theme/palette';

const PricingsGrid = styled(Box)(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  justifyContent: 'space-evenly',
  gap: '3rem',
  marginTop: '50px',
  padding: '0 10px',
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
  const [filterValues, setFilterValues] = useState({});
  const [textFilterValue, setTextFilterValue] = useState('');

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

  useEffect(() => {
    const filters = {
      name: textFilterValue,
      ...filterValues,
    }
    console.log('Filters:', filters);
  }, [textFilterValue, filterValues]);

  return (
    <>
      <Helmet>
        <title> SPHERE - Pricings </title>
      </Helmet>
      <Box
        sx={{
          ...flex({}),
          maxWidth: '2000px',
          height: '100%',
        }}
      >
        <Box
          component="div"
          sx={{
            ...flex({ direction: 'column', justify: "start" }),
            maxWidth: '600px',
            height: '100%',
            margin: 'auto',
            backgroundColor: grey[200],
            borderRight: '1px solid',
            borderRightColor: grey[300],
          }}
        >
          <Box component="div" width="20vw"></Box>
          <PricingFilters 
            textFilterValue={textFilterValue}
            setFilterValues={setFilterValues}
          />
        </Box>
        <Box
          component="div"
          sx={{
            ...flex({ direction: 'column' }),
            marginTop: '50px',
            flexGrow: 1,
          }}
        >
          <SearchBar 
            setTextFilterValue={setTextFilterValue}
          />
          <PricingsGrid>
            {Object.values(pricingsList).map((pricing, index) => {
              return (
                <PricingListCard key={`pricing-${index}`} name={pricing.name} dataEntry={pricing} />
              );
            })}
          </PricingsGrid>
        </Box>
      </Box>
    </>
  );
}
