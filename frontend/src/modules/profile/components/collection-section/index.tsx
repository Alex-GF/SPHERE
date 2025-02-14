import { Box, IconButton, Typography } from '@mui/material';
import { FaFolder } from 'react-icons/fa';
import { IoMdAddCircleOutline } from "react-icons/io";
import { usePricingCollectionsApi } from '../../api/pricingCollectionsApi';
import { useEffect, useState } from 'react';
import { CollectionEntry } from '../../types/profile-types';
import { flex } from '../../../core/theme/css';
import { useRouter } from '../../../core/hooks/useRouter';
import CollectionListCard from '../../../pricing/components/collection-list-card';

export default function CollectionSection() {
  const [collections, setCollections] = useState([]);

  const { getLoggedUserCollections } = usePricingCollectionsApi();
  const router = useRouter();

  function handleAddCollection() {
    router.push("/pricings/collections/new");
  }

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
        console.error('Cannot GET collections. Error:', error);
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
        <IconButton size="large" onClick={handleAddCollection}>
          <IoMdAddCircleOutline/>
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
              <CollectionListCard collection={collection}/>
            ))}
          </Box>
        ) : (
          <Box sx={{marginTop: "20px"}}>You have no collections</Box>
        )}
      </Box>
    </Box>
  );
}
