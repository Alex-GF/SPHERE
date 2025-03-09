import { Container, Modal, Paper } from '@mui/material';
import CreateCollectionForm from '../../components/create-collection-form';
import { flex } from '../../../core/theme/css';
import { useState } from 'react';
import CollectionLoader from '../../../core/components/collection-loader';
import { Box } from '@mui/system';

export default function CreateCollectionPage() {
  
  const [showLoading, setShowLoading] = useState(false);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <CreateCollectionForm setShowLoading={setShowLoading}/>
      <Modal open={showLoading}>
        <Paper
          elevation={3}
          sx={{
            maxWidth: 600,
            width: '90dvw',
            maxHeight: "auto",
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
          <Box sx={{...flex({ direction: 'column' }), height: "100%"}}>
            <CollectionLoader />
          </Box>
          <h3 style={{ textAlign: 'center', zIndex: 1 }}>Uploading pricings to collection. This may take a few minutes...</h3>
        </Paper>
      </Modal>
    </Container>
  );
}
