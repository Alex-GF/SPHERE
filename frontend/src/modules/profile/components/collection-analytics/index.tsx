import { IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { OpenInFull } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts';
import type { CollectionAnalytics } from '../../types/collection';

interface StatsProps {
  collectionData: CollectionAnalytics;
  toggleModal: () => void;
}

function formatStringDates(dates: string[]){
  return dates
  .map(date => new Date(date).toISOString().split('T')[0])
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
            label: 'Different Subscriptions Available',
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
              label: 'Min Price Subscription',
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
