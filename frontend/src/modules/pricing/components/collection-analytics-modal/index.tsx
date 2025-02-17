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
  startDate: string | null;
  endDate: string | null;
}

export default function CollectionAnalyticsModal({
  open,
  onClose,
  collectionData,
  startDate,
  endDate
}: CollectionAnalyticsModalProps) {

  function dateIntervalFilter(_: any, index: number) {
    const entryDate = new Date(collectionData.evolutionOfConfigurationSpaceSize.dates[index]);

    return entryDate >= new Date(startDate!) && entryDate <= new Date(endDate!);
  }

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
                      (startDate && endDate
                        ? value.values.filter(dateIntervalFilter)
                        : value.values
                      ).map((v: any) => (typeof v === 'number' ? parseFloat(v.toFixed(2)) : v)) ??
                      [],
                    area: false,
                    showMark: value.values.length <= 1,
                    label: `Average ${key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())}`,
                  },
                ]}
                xAxis={[
                  {
                    scaleType: 'point',
                    data: formatStringDates((startDate && endDate
                      ? value.dates.filter(dateIntervalFilter)
                      : value.dates
                    )),
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
