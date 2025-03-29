import { Box, Button, Stack, styled, Typography } from '@mui/material';
import { AnalyticsDataEntry } from '../../../../assets/data/analytics';
import { useEffect, useState } from 'react';
import VisibilityOptions from '../visibility-options';
import customConfirm from '../../../core/utils/custom-confirm';
import customAlert from '../../../core/utils/custom-alert';
import { usePricingsApi } from '../../api/pricingsApi';
import { useRouter } from '../../../core/hooks/useRouter';

export const SettingsPage = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  width: '100%',
  height: '100dvh',
  overflow: 'auto',
});

export const DangerZone = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  width: '75%',
  borderRadius: '15px',
  border: '1px solid red',
  margin: '20px 0',
});

export default function PricingSettings({
  pricingName,
  pricingData,
  updatePricingInformation,
}: {
  pricingName: string;
  pricingData: AnalyticsDataEntry[];
  updatePricingInformation: (pricing: any) => void;
}) {
  const [visibility, setVisibility] = useState('Public');

  const { updatePricing, removePricingByName } = usePricingsApi();
  const router = useRouter();

  function handleVisibilityChange() {
    customConfirm('Are you sure you want to change the visibility of this pricing?')
      .then(() => {
        const pricingUpdateBody = {
          private: !(visibility === 'Private'),
        };

        updatePricing(pricingName, pricingUpdateBody)
          .then((pricing: any) => {
            updatePricingInformation(pricing);
            setVisibility(visibility === 'Private' ? 'Public' : 'Private');
            customAlert('Pricing visibility updated successfully');
          })
          .catch((error: Error) => {
            customAlert(`Error: ${error.message}`);
          });
      })
      .catch(() => {});
  }

  function handleDeletePricing() {
    customConfirm('Are you sure you want to delete this pricing? This action is irreversible.')
      .then(() => {
        removePricingByName(pricingName, pricingData[0].collectionName)
          .then(() => {
            customConfirm('Pricing deleted successfully. Do you want to return to the main page?')
              .then(() => {
                router.push('/');
              })
              .catch(() => {
                router.push('/me/pricings');
              });
          }).catch((error) => {
            customAlert(`An error has occurred while removing the pricing. Please, try again later.`);
          });
      })
  }

  useEffect(() => {
    setVisibility(pricingData[0].private ? 'Private' : 'Public');
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
              Delete this pricing
            </Typography>
            <Typography variant="body1" marginBottom={2}>
              Once you delete a pricing, there is no going back. Please be certain.
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeletePricing}
            sx={{ fontWeight: 'bold', '&:hover': { backgroundColor: 'red', color: 'white' } }}
          >
            Delete pricing
          </Button>
        </Box>
      </DangerZone>
    </SettingsPage>
  );
}
