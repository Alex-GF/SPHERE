import { IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { OpenInFull } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts';
import type { CollectionAnalytics } from '../../types/collection';
import { formatStringDates } from '../../utils/dates-util';

interface StatsProps {
  collectionData: CollectionAnalytics;
  toggleModal: () => void;
}

export default function CollectionAnalytics({ collectionData, toggleModal }: StatsProps) {
  console.log(collectionData);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Analytics
        </Typography>
        <IconButton title="Discover more" onClick={toggleModal}>
          <OpenInFull />
        </IconButton>
      </Box>
      <LineChart
        width={500}
        height={300}
        series={[
          {
            data: collectionData.evolutionOfPlans.values.reverse() ?? [],
            label: 'Averge Number of Plans',
            area: false,
            showMark: true,
          },
        ]}
        xAxis={[
          {
            scaleType: 'point',
            data: formatStringDates(collectionData.evolutionOfPlans.dates)
          },
        ]}
      />
      <Box>
        <LineChart
          width={500}
          height={300}
          series={[
            {
              data: collectionData.evolutionOfAddOns.values.reverse() ?? [],
              area: false,
              showMark: true,
              label: 'Average Number of AddOns',
            },
          ]}
          xAxis={[
            {
              scaleType: 'point',
              data: formatStringDates(collectionData.evolutionOfAddOns.dates)
            },
          ]}
        />
      </Box>
    </>
  );
}
