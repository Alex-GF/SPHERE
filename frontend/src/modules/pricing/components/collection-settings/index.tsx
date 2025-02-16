import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import VisibilityOptions from '../visibility-options';
import customConfirm from '../../../core/utils/custom-confirm';
import customAlert from '../../../core/utils/custom-alert';
import { usePricingsApi } from '../../api/pricingsApi';
import { useRouter } from '../../../core/hooks/useRouter';
import { Collection } from '../../types/collection';
import { DangerZone, SettingsPage } from '../pricing-settings';

export default function CollectionSettings({
  collection,
  updateCollection
}: {
  collection: Collection;
  updateCollection: (collection: Collection) => void;
}) {
  const [visibility, setVisibility] = useState('Public');

  const { updatePricing, removePricingByName } = usePricingsApi();
  const router = useRouter();

  function handleVisibilityChange() {
    customConfirm('Are you sure you want to change the visibility of this collection?')
      .then(() => {
        const pricingUpdateBody = {
          private: !(visibility === 'Private'),
        };

        updatePricing(collection.name, pricingUpdateBody)
          .then((pricing: any) => {
            updateCollection(pricing);
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
    customConfirm('Are you sure you want to delete this pricing? This action is irreversible.')
      .then(() => {
        removePricingByName(collection.name)
          .then(() => {
            customConfirm('Pricing deleted successfully. Do you want to return to the main page?')
              .then(() => {
                router.push('/');
              })
              .catch(() => {
                router.push('/me/pricings');
              });
          }).catch((error) => {
            console.log(error);
            customAlert(`An error has occurred while removing the pricing. Please, try again later.`);
          });
      })
  }

  function handleDeleteCollectionAndPricings() {
    customConfirm('Are you sure you want to delete this pricing? This action is irreversible.')
      .then(() => {
        removePricingByName(collection.name)
          .then(() => {
            customConfirm('Pricing deleted successfully. Do you want to return to the main page?')
              .then(() => {
                router.push('/');
              })
              .catch(() => {
                router.push('/me/pricings');
              });
          }).catch((error) => {
            console.log(error);
            customAlert(`An error has occurred while removing the pricing. Please, try again later.`);
          });
      })
  }

  useEffect(() => {
    setVisibility(collection.private ? 'Private' : 'Public');
  }, []);

  return (
    <SettingsPage>
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
              This action will delete this collection forever, but not its pricings. Please be certain.
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
              This action will delete this collection and all pricings associated with it forever. Please be certain.
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
