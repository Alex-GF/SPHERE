import { Box, IconButton, Typography } from '@mui/material';
import { FaSort, FaFolder } from 'react-icons/fa';
import { usePricingCollectionsApi } from '../../../pricing/api/pricingCollectionsApi';
import { useEffect, useState } from 'react';
import { CollectionEntry } from '../../types/profile-types';
import { flex } from '../../../core/theme/css';

export default function CollectionSection() {
  const [collections, setCollections] = useState([]);

  const { getLoggedUserCollections } = usePricingCollectionsApi();

  useEffect(() => {
    getLoggedUserCollections()
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        } else if (data.collections) {
          setCollections(data.collections);
        }
      })
      .catch(error => {
        console.log('Cannot GET collections. Error:', error);
      });
  }, []);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="h6">
          Collections {collections.length > 0 && `(${collections.length})`}{' '}
        </Typography>
        <IconButton size="small">
          <FaSort />
        </IconButton>
      </Box>

      {/* List of collections */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {collections && collections.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 5,
            }}
          >
            {collections.map((collection: CollectionEntry) => (
              <Box
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  p: 2,
                  ...flex({ direction: 'column' }),
                  width: '200px',
                }}
                key={`collection-${collection.name}`}
              >
                <FaFolder fontSize={100} />
                <Typography variant="subtitle1">{collection.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {collection.numberOfPricings} pricings
                  {/* · Updated Jun 29, 2023 · 105 descargas */}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{marginTop: "20px"}}>You have no collections</Box>
        )}
      </Box>
    </Box>
  );
}
