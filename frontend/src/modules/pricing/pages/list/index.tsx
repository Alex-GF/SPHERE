import { Box, styled } from '@mui/material';
import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import PricingListCard from '../../components/pricing-list-card';
import { usePricingsApi } from '../../api/pricingsApi';
import SearchBar from '../../components/search-bar';
import { flex } from '../../../core/theme/css';
import PricingFilters from '../../components/pricing-filters';
import { grey } from '../../../core/theme/palette';

export const PricingsGrid = styled(Box)(() => ({
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
  owner: string;
  version: string;
  extractionDate: string;
  currency: string;
  analytics: {
    configurationSpaceSize: number;
    minSubscriptionPrice: number;
    maxSubscriptionPrice: number;
  };
};

export type FilterValues = {
  max: number;
  min: number;
  data: {
    value: string;
    count: number;
  }[];
};

export type FilterLimits = {
  [key: string]: FilterValues;
};

export default function PricingListPage() {
  const [pricingsList, setPricingsList] = useState<PricingEntry[]>([]);
  const [filterLimits, setFilterLimits] = useState<FilterLimits | null>(null);
  const [filterValues, setFilterValues] = useState({});
  const [textFilterValue, setTextFilterValue] = useState('');

  const { getPricings } = usePricingsApi();

  useEffect(() => {
    getPricings()
      .then(data => {
        setPricingsList(data.pricings);
        if (data.pricings.length > 0) {
          setFilterLimits({
            minPrice: data.minPrice,
            maxPrice: data.maxPrice,
            configurationSpaceSize: data.configurationSpaceSize,
            owners: data.pricings.map((pricing: PricingEntry) => pricing.owner),
          });
        }else{
          setFilterLimits({
            minPrice: {min: 0, max: 0, data: []},
            maxPrice: {min:0, max: 0, data: []},
            configurationSpaceSize: {min: 0, max: 0, data: []},
            owners: data.pricings.map((pricing: PricingEntry) => pricing.owner),
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  useEffect(() => {
    const filters = {
      name: textFilterValue,
      ...filterValues,
    };

    getPricings(filters)
      .then(data => {
        setPricingsList(data.pricings);
        
        if (data.pricings.length > 0) {
          setFilterLimits({
            minPrice: data.minPrice,
            maxPrice: data.maxPrice,
            configurationSpaceSize: data.configurationSpaceSize,
            owners: data.pricings.map((pricing: PricingEntry) => pricing.owner),
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [textFilterValue, filterValues]);

  return (
    <>
      <Helmet>
        <title> SPHERE - Pricings </title>
      </Helmet>
      <Box
        sx={{
          ...flex({}),
          width: '100vw',
          maxWidth: '2000px',
          height: '100%',
        }}
      >
        <Box
          component="div"
          sx={{
            ...flex({ direction: 'column', justify: 'start' }),
            maxWidth: '600px',
            height: '100%',
            margin: 'auto',
            backgroundColor: grey[200],
            borderRight: '1px solid',
            borderRightColor: grey[300],
          }}
        >
          <Box component="div" width="20vw"></Box>
          {filterLimits && (
            <PricingFilters
              filterLimits={filterLimits}
              receivedOwners={pricingsList.reduce((acc, pricing) => {
                acc[pricing.owner] = (acc[pricing.owner] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)}
              textFilterValue={textFilterValue}
              setFilterValues={setFilterValues}
            />
          )}
        </Box>
        <Box
          component="div"
          sx={{
            ...flex({ direction: 'column' }),
            marginTop: '50px',
            flexGrow: 1,
          }}
        >
          <SearchBar setTextFilterValue={setTextFilterValue} />
          <PricingsGrid>
            {pricingsList.length > 0 ? Object.values(pricingsList).map((pricing, index) => {
              return (
                <PricingListCard key={`pricing-${index}`} name={pricing.name} owner={pricing.owner} dataEntry={pricing} />
              );
            }): <Box>No pricings found</Box>}
          </PricingsGrid>
        </Box>
      </Box>
    </>
  );
}
