import { useState } from 'react';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import VisibilityOptions from '../../../pricing/components/visibility-options';
import CollectionNameInput from '../collection-name-input';
import CollectionDescriptionInput from '../collection-description-input';
import PricingSelector from '../pricings-selector';
import { usePricingCollectionsApi } from '../../api/pricingCollectionsApi';
import { useRouter } from '../../../core/hooks/useRouter';
import FileUpload from '../../../core/components/file-upload-input';
import { grey, primary } from '../../../core/theme/palette';
import { flex } from '../../../core/theme/css';

export interface CreateCollectionFormFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export default function CreateCollectionForm({setShowLoading}: { setShowLoading: (show: boolean) => void }) {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [selectedPricings, setSelectedPricings] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const { createCollection, createBulkCollection } = usePricingCollectionsApi();
  const router = useRouter();

  const handleSubmit = (file: any) => {
    const fileToUpload = file instanceof File ? file : null;

    if (!fileToUpload) {
      const collectionToCreate = {
        name: collectionName,
        description: collectionDescription,
        private: visibility === 'Private',
        pricings: selectedPricings,
      };

      createCollection(collectionToCreate)
        .then(() => {
          router.push('/me/pricings');
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      const formData = new FormData();

      formData.append('zip', fileToUpload);
      formData.append('name', collectionName);
      formData.append('description', collectionDescription);
      formData.append('private', visibility === 'Private' ? 'true' : 'false');

      setShowLoading(true);

      createBulkCollection(formData)
        .then(() => {
          setShowLoading(false);
          router.push('/me/pricings');
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  return (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" align="center" marginBottom={5} fontWeight="bold">
        Create a collection to store your pricings
      </Typography>
      <CollectionNameInput value={collectionName} onChange={setCollectionName} />
      <CollectionDescriptionInput
        value={collectionDescription}
        onChange={setCollectionDescription}
      />
      <VisibilityOptions value={visibility} onChange={setVisibility} />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Select unassigned pricings" />
          <Tab label="Upload collection" />
        </Tabs>
      </Box>
      {tabValue === 0 ? (
        <>
          <PricingSelector value={selectedPricings} onChange={setSelectedPricings} />{' '}
          <Box sx={{ ...flex({}) }}>
            <Button
              onClick={handleSubmit}
              sx={{
                backgroundColor: primary[700],
                color: grey[100],
                fontWeight: 'bold',
                fontSize: 16,
                px: 5,
                py: 2,
                mt: 5,
                borderRadius: 3,
                width: 400,
              }}
            >
              Add Collection
            </Button>
          </Box>
        </>
      ) : (
        <FileUpload
          onSubmit={handleSubmit}
          submitButtonText="Add Collection"
          submitButtonWidth={400}
          isDragActiveText="Drop a .zip file containing all the pricings of the collection"
          isNotDragActiveText="Drag and drop a .zip file containing all the pricings of the collection"
          accept={{ 'application/zip': ['.zip'] }}
        />
      )}
    </Box>
  );
}
