import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import VisibilityOptions from '../../../pricing/components/visibility-options';
import CollectionNameInput from '../collection-name-input';
import CollectionDescriptionInput from '../collection-description-input';
import PricingSelector from '../pricings-selector';
import { usePricingCollectionsApi } from '../../api/pricingCollectionsApi';
import { useRouter } from '../../../core/hooks/useRouter';

export interface CreateCollectionFormFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export default function CreateCollectionForm () {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [selectedPricings, setSelectedPricings] = useState<string[]>([]);

  const {createCollection} = usePricingCollectionsApi();
  const router = useRouter();

  const handleSubmit = () => {

    const collectionToCreate = {
      name: collectionName,
      description: collectionDescription,
      private: visibility === 'Private',
      pricings: selectedPricings,
    }

    createCollection(collectionToCreate)
      .then(() => {
        router.push("/me/pricings");
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" align="center" marginBottom={5} fontWeight="bold">Create a collection to store your pricings</Typography>
      <CollectionNameInput value={collectionName} onChange={setCollectionName} />
      <CollectionDescriptionInput value={collectionDescription} onChange={setCollectionDescription} />
      <VisibilityOptions value={visibility} onChange={setVisibility} />
      <PricingSelector value={selectedPricings} onChange={setSelectedPricings}/>
      <Button 
        variant="contained" 
        onClick={handleSubmit} 
        sx={{ mt: 3 }}
      >
        Add pricing
      </Button>
      <Box sx={{ height: 50 }} />
    </Box>
  );
};
