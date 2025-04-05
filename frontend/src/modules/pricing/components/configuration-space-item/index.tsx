import { Box, Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material';
import { Configuration } from '../configuration-space-view';
import { FaCircleCheck } from 'react-icons/fa6';
import { success } from '../../../core/theme/palette';
import { flex } from '../../../core/theme/css';
import { formatPricingComponentName } from '../../../pricing-editor/services/pricing.service';

export default function ConfigurationSpaceItem({
  configuration,
  onClick,
}: {
  configuration: Configuration;
  onClick: (configuration: Configuration) => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        boxShadow: 1,
        '&:hover': {
          cursor: 'pointer',
          boxShadow: '0 0 0 2px rgb(0, 0, 0)',
        },
      }}
      onClick={() => onClick(configuration)}
    >
      <CardContent>
        <Typography variant="h5" component="div" fontWeight={600}>
          {configuration.selectedPlan}
        </Typography>
        {configuration.selectedAddons.length > 0 && (
          <List dense>
            {configuration.selectedAddons.map((addon, j) => (
              <ListItem key={j} disableGutters sx={{ ...flex({ align: 'center' }) }}>
                <Box marginRight={1} sx={{ ...flex({}) }}>
                  <FaCircleCheck fill={success.light} />
                </Box>
                <ListItemText primary={formatPricingComponentName(addon)} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
