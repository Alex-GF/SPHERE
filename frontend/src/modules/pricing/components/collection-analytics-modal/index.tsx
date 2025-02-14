import { IconButton, Modal, Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { CloseFullscreen } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts';
import { CollectionAnalytics } from '../../types/collection';
import { formatStringDates } from '../../../profile/utils/dates-util';

interface CollectionAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  collectionData: CollectionAnalytics;
}

export default function CollectionAnalyticsModal({
  open,
  onClose,
  collectionData,
}: CollectionAnalyticsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: '80%', minWidth: '50%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>
            Analytics
          </Typography>
          <IconButton title="Reduce view" onClick={onClose}>
            <CloseFullscreen />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 3,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          {Object.entries(collectionData).map(([key, value]) => (
            <Box key={key}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Over Time
              </Typography>
              <LineChart
                width={500}
                height={300}
                series={[
                  {
                    data:
                      value.values
                        .reverse()
                        .map((v: any) => (typeof v === 'number' ? parseFloat(v.toFixed(2)) : v)) ??
                      [],
                    area: false,
                    showMark: false,
                    label: `Average ${key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())}`,
                  },
                ]}
                xAxis={[
                  {
                    scaleType: 'point',
                    data: formatStringDates(value.dates),
                  },
                ]}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Modal>
  );
}
