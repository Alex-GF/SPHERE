import { Box, Fade, Modal, Typography } from '@mui/material';
import { Configuration } from '../configuration-space-view';
import { formatPricingComponentName } from '../../../pricing-editor/services/pricing.service';
import FlagGrid from './components/elem-flags';

export default function ConfigurationDetailsModal({
  configuration,
  isOpen,
  handleClose,
}: Readonly<{
  configuration: Configuration | undefined;
  isOpen: boolean;
  handleClose: () => void;
}>) {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 1200,
            height: '90dvh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {configuration?.selectedPlan && (
            <Box sx={{ my: 4, ml: 4 }}>
              <Typography variant="h2" sx={{ mr: 4, textAlign: 'center' }}>
                Plan <strong>{configuration?.selectedPlan}</strong>
              </Typography>
            </Box>
          )}

          {configuration?.selectedAddons && configuration?.selectedAddons.length > 0 && (
            <Box sx={{ my: 4, ml: 4 }}>
              <Typography variant="h2" sx={{ mr: 4, fontWeight: 'bold', textAlign: 'center' }}>
                Add-ons
              </Typography>

              <FlagGrid
                data={configuration.selectedAddons.map(addon => formatPricingComponentName(addon))}
              />
            </Box>
          )}

          {configuration?.subscriptionFeatures &&
            configuration?.subscriptionFeatures.length > 0 && (
              <Box sx={{ my: 4, ml: 4 }}>
                <Typography variant="h2" sx={{ mr: 4, fontWeight: 'bold', textAlign: 'center' }}>
                  Features
                </Typography>

                <FlagGrid
                  data={configuration.subscriptionFeatures.map(addon =>
                    formatPricingComponentName(addon)
                  )}
                />
              </Box>
            )}
        </Box>
      </Fade>
    </Modal>
  );
}
