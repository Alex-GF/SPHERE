import { Button, Modal, Paper } from '@mui/material';
import CollectionsGrid from '../collections-grid';
import { CollectionEntry } from '../../types/profile-types';
import { flex } from '../../../core/theme/css';
import { useRef } from 'react';
import { usePricingsApi } from '../../../pricing/api/pricingsApi';

export default function AddPricingToCollectionModal({
  pricingName,
  modalState,
  handleClose,
  collections,
}: {
  pricingName: string;
  modalState: boolean;
  handleClose: () => void;
  collections: CollectionEntry[];
}) {
  const collectionSelector = useRef(null);

  const {addPricingToCollection} = usePricingsApi();

  function handleAddPricingToCollection() {
    const selectedCollection = (
      collectionSelector.current! as { selectedCollection: string | null }
    ).selectedCollection;
    
    addPricingToCollection(pricingName, selectedCollection!)
      .then(() => {
        handleClose();
        alert(`${pricingName} added to collection`);
        window.location.reload();
      }).catch((error) => {
        console.error(error);
      });
  }

  return (
    <Modal
      open={modalState}
      onClose={handleClose}
      aria-labelledby="modal-import-title"
      aria-describedby="modal-import-description"
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 2000,
          width: '90dvw',
          mx: 'auto',
          mt: 4,
          p: 4,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          borderRadius: '20px',
          ...flex({ direction: 'column' }),
        }}
      >
        <h2>Select a collection to save the pricing</h2>
        <CollectionsGrid collections={collections} selector ref={collectionSelector} />
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleAddPricingToCollection}
        >
          Save
        </Button>
      </Paper>
    </Modal>
  );
}
