import { Box, styled } from '@mui/material';
import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import SearchBar from '../../components/search-bar';
import { flex } from '../../../core/theme/css';
import { grey } from '../../../core/theme/palette';
import { usePricingCollectionsApi } from '../../../profile/api/pricingCollectionsApi';
import CollectionListCard from '../../components/collection-list-card';
import { CollectionEntry } from '../../../profile/types/profile-types';
import CollectionFilters from '../../components/collection-filters';
import { v4 as uuidv4 } from 'uuid';

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

export default function CollectionsListPage() {
  const [collectionsList, setCollectionsList] = useState<CollectionEntry[]>([]);
  const [filterLimits, setFilterLimits] = useState<FilterLimits | null>(null);
  const [filterValues, setFilterValues] = useState({});
  const [textFilterValue, setTextFilterValue] = useState('');

  const { getCollections } = usePricingCollectionsApi();

  useEffect(() => {
    getCollections()
      .then(data => {
        setCollectionsList(data.collections);

        setFilterLimits({
          owners: data.collections.map((collection: CollectionEntry) => collection.owner),
        });
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

    getCollections(filters)
      .then(data => {
        setCollectionsList(data.collections);

        if (data.collections.length > 0) {
          setFilterLimits({
            owners: data.collections.map((collection: CollectionEntry) => collection.owner),
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
        <title> SPHERE - Collections </title>
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
          {filterLimits && collectionsList.length > 0 && (
            <CollectionFilters
              receivedOwners={collectionsList.reduce((acc, collection) => {
                acc[collection.owner.username] = (acc[collection.owner.username] || 0) + 1;
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
          <PricingsGrid sx={{ marginBottom: '50px' }}>
            {collectionsList.length > 0 ? (
              Object.values(collectionsList).map(collection => {
                return (
                  <CollectionListCard
                    key={uuidv4()}
                    collection={collection}
                  />
                );
              })
            ) : (
              <Box>No collections found</Box>
            )}
          </PricingsGrid>
        </Box>
      </Box>
    </>
  );
}
