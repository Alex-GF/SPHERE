import { Container } from '@mui/material';
import CreateCollectionForm from '../../components/create-collection-form';
import { useState } from 'react';
import LoadingModal from '../../../core/components/loading-modal';

export default function CreateCollectionPage() {
  
  const [showLoading, setShowLoading] = useState(false);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <CreateCollectionForm setShowLoading={setShowLoading}/>
      <LoadingModal showLoading={showLoading}/>
    </Container>
  );
}
