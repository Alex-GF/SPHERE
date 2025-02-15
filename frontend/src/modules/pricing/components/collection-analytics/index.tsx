import { IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { OpenInFull } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts';
import type { CollectionAnalytics } from '../../types/collection';
import { formatStringDates } from '../../../profile/utils/dates-util';

interface StatsProps {
  collectionData: CollectionAnalytics;
  toggleModal: () => void;
}

export default function CollectionAnalytics({ collectionData, toggleModal }: StatsProps) {
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
            data: collectionData.evolutionOfConfigurationSpaceSize.values.reverse().map((v: any) => typeof v === "number" ? parseFloat(v.toFixed(2)) : v) ?? [],
            label: 'Average Configuration Space Size',
            area: false,
            showMark: collectionData.evolutionOfConfigurationSpaceSize.values.length <= 1,
          },
        ]}
        xAxis={[
          {
            scaleType: 'point',
            data: formatStringDates(collectionData.evolutionOfConfigurationSpaceSize.dates)
          },
        ]}
      />
      <Box>
        <LineChart
          width={500}
          height={300}
          series={[
            {
              data: collectionData.evolutionOfAddOns.values.reverse().map((v: any) => typeof v === "number" ? parseFloat(v.toFixed(2)) : v) ?? [],
              area: false,
              showMark: collectionData.evolutionOfAddOns.values.length <= 1,
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
