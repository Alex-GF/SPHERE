import { Box, IconButton, Typography } from '@mui/material';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { usePricingCollectionsApi } from '../../api/pricingCollectionsApi';
import { useEffect, useState } from 'react';
import { useRouter } from '../../../core/hooks/useRouter';
import CollectionsGrid from '../collections-grid';
import AddPricingToCollectionModal from '../add-pricing-to-collection-modal';

export default function CollectionSection({
  pricingToAdd,
  addPricingToCollectionModalOpen,
  setAddPricingToCollectionModalOpen,
}: {
  pricingToAdd: string;
  addPricingToCollectionModalOpen: boolean;
  setAddPricingToCollectionModalOpen: (value: boolean) => void;
}) {
  const [collections, setCollections] = useState([]);

  const { getLoggedUserCollections } = usePricingCollectionsApi();
  const router = useRouter();

  function handleAddCollection() {
    router.push('/pricings/collections/new');
  }

  function handleAddPricingToCollectionModalClose() {
    setAddPricingToCollectionModalOpen(false);
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
    <>
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
            <IoMdAddCircleOutline />
          </IconButton>
        </Box>

        {/* List of collections */}
        <CollectionsGrid collections={collections} />
      </Box>
      <AddPricingToCollectionModal
        pricingName={pricingToAdd}
        modalState={addPricingToCollectionModalOpen}
        handleClose={handleAddPricingToCollectionModalClose}
        collections={collections}
      />
    </>
  );
}
