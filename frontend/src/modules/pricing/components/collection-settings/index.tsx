import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import VisibilityOptions from '../visibility-options';
import customConfirm from '../../../core/utils/custom-confirm';
import customAlert from '../../../core/utils/custom-alert';
import { useRouter } from '../../../core/hooks/useRouter';
import { Collection } from '../../types/collection';
import { DangerZone, SettingsPage } from '../pricing-settings';
import { usePricingCollectionsApi } from '../../../profile/api/pricingCollectionsApi';

export default function CollectionSettings({
  collection,
  updateCollectionMethod,
}: {
  collection: Collection;
  updateCollectionMethod: (collection: Collection) => void;
}) {
  const [visibility, setVisibility] = useState('Public');

  const { updateCollection, deleteCollection } = usePricingCollectionsApi();
  const router = useRouter();

  function handleRename() {
    customConfirm(
      `Are you sure you want to change the name of this collection? You'll be redirected to your profile page.`
    ).then(() => {
      const newName = (document.getElementById('collectionNameInput') as HTMLInputElement).value;

      updateCollection(collection.name, { name: newName });

      router.push(`/me/pricings`);
    });
  }

  function handleDescriptionChange() {
    const newDescription = (document.getElementById('collectionDescriptionInput') as HTMLInputElement).value;

    updateCollection(collection.name, { description: newDescription });

    customAlert('Description updated!');
  }

  function handleVisibilityChange() {
    customConfirm('Are you sure you want to change the visibility of this collection?')
      .then(() => {
        const collectionUpdateBody = {
          private: !(visibility === 'Private'),
        };

        updateCollection(collection.name, collectionUpdateBody)
          .then((data: any) => {
            if (data.error) {
              customAlert(`Error: ${data.error}`);
              return;
            }
            updateCollectionMethod(data);
            setVisibility(visibility === 'Private' ? 'Public' : 'Private');
            customAlert('Pricing visibility updated successfully');
          })
          .catch((error: Error) => {
            customAlert(`Error: ${error.message}`);
          });
      })
      .catch(() => {});
  }

  function handleDeleteCollection() {
    customConfirm(
      'Are you sure you want to delete this collection and preserve its pricings? This action is irreversible.'
    ).then(() => {
      deleteCollection(collection.name, false)
        .then(() => {
          router.push('/me/pricings');
        })
        .catch(error => {
          console.log(error);
          customAlert(
            `An error has occurred while removing the collection. Please, try again later.`
          );
        });
    });
  }

  function handleDeleteCollectionAndPricings() {
    customConfirm(
      'Are you sure you want to delete this collection and its pricings? This action is irreversible.'
    ).then(() => {
      deleteCollection(collection.name, true)
        .then(() => {
          router.push('/me/pricings');
        })
        .catch(error => {
          customAlert(
            `An error has occurred while removing the collection. Please, try again later.`
          );
        });
    });
  }

  useEffect(() => {
    setVisibility(collection.private ? 'Private' : 'Public');
  }, []);

  return (
    <SettingsPage>
      <Box marginBottom={3}>
        <Typography variant="h5" fontWeight="bold">
          Global Settings
        </Typography>
        <Box marginTop={3} paddingLeft={5} display="flex" alignItems="center" maxWidth={800}>
          <TextField
            defaultValue={collection.name}
            id="collectionNameInput"
            variant="outlined"
            size="small"
            fullWidth
            style={{ marginRight: '10px' }}
          />
          <Button variant="outlined" color="primary" onClick={handleRename}>
            Rename
          </Button>
        </Box>
        <Box marginTop={3} paddingLeft={5} display="flex" alignItems="center" maxWidth={800}>
          <TextField
            type="textarea"
            id="collectionDescriptionInput"
            placeholder="Description of this collection"
            defaultValue={collection.description}
            fullWidth
            multiline
            rows={5}
            style={{ marginRight: '10px' }}
          />
          <Button variant="outlined" color="primary" onClick={handleDescriptionChange}>
            Change
          </Button>
        </Box>
      </Box>
      <Typography variant="h5" fontWeight="bold" marginBottom={3}>
        Visibility
      </Typography>
      <Box paddingLeft={5}>
        <VisibilityOptions value={visibility} onChange={handleVisibilityChange} />
      </Box>
      <Typography variant="h5" fontWeight="bold" marginTop={3}>
        Danger zone
      </Typography>
      <DangerZone>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
          }}
        >
          <Stack spacing={2} direction={'column'}>
            <Typography variant="h6" fontWeight="bold" marginBottom={2}>
              Delete this collection
            </Typography>
            <Typography variant="body1" marginBottom={2}>
              This action will delete this collection forever, but not its pricings. Please be
              certain.
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteCollection}
            sx={{ fontWeight: 'bold', '&:hover': { backgroundColor: 'red', color: 'white' } }}
          >
            Delete collection
          </Button>
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
          }}
        >
          <Stack spacing={2} direction={'column'}>
            <Typography variant="h6" fontWeight="bold" marginBottom={2}>
              Delete this collection and its pricings
            </Typography>
            <Typography variant="body1" marginBottom={2}>
              This action will delete this collection and all pricings associated with it forever.
              Please be certain.
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteCollectionAndPricings}
            sx={{ fontWeight: 'bold', '&:hover': { backgroundColor: 'red', color: 'white' } }}
          >
            Delete collection and pricings
          </Button>
        </Box>
      </DangerZone>
    </SettingsPage>
  );
}
