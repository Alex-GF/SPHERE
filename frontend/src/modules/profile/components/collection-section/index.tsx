import { Box, IconButton, Typography } from '@mui/material';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { FaSortAlphaDown, FaSortAlphaUpAlt } from "react-icons/fa";
import { usePricingCollectionsApi } from '../../api/pricingCollectionsApi';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from '../../../core/hooks/useRouter';
import CollectionsGrid from '../collections-grid';
import AddPricingToCollectionModal from '../add-pricing-to-collection-modal';
import { useAuth } from '../../../auth/hooks/useAuth';

export default function CollectionSection({
  pricingToAdd,
  addPricingToCollectionModalOpen,
  setAddPricingToCollectionModalOpen,
  renderFlag,
  setRenderFlag
}: {
  pricingToAdd: string;
  addPricingToCollectionModalOpen: boolean;
  setAddPricingToCollectionModalOpen: (value: boolean) => void;
  renderFlag: boolean;
  setRenderFlag: (value: boolean) => void;
}) {
  const [collections, setCollections] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { getLoggedUserCollections } = usePricingCollectionsApi();
  const { authUser } = useAuth();
  const router = useRouter();

  function handleAddCollection() {
    router.push('/pricings/collections/new');
  }

  function handleAddPricingToCollectionModalClose() {
    setRenderFlag(!renderFlag);
    setAddPricingToCollectionModalOpen(false);
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
  };

  useEffect(() => {
    if (!authUser.isAuthenticated) {
      return;
    }
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
  }, [renderFlag, authUser]);

  const sortedCollections = useMemo(() => {
    return [...collections].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }, [collections, sortOrder]);

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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">
              Collections {collections.length > 0 && `(${collections.length})`}
            </Typography>
            <IconButton onClick={toggleSortOrder} size="medium">
              {sortOrder === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUpAlt />}
            </IconButton>
          </Box>
          <IconButton size="large" onClick={handleAddCollection}>
            <IoMdAddCircleOutline />
          </IconButton>
        </Box>

        {/* List of collections */}
        <CollectionsGrid collections={sortedCollections} />
      </Box>
      <AddPricingToCollectionModal
        pricingName={pricingToAdd}
        modalState={addPricingToCollectionModalOpen}
        handleClose={handleAddPricingToCollectionModalClose}
        collections={sortedCollections}
      />
    </>
  );
}