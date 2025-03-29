import { IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { OpenInFull } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts';
import type { CollectionAnalytics } from '../../types/collection';
import { formatStringDates } from '../../../profile/utils/dates-util';
import { flex } from '../../../core/theme/css';

interface StatsProps {
  collectionData: CollectionAnalytics;
  toggleModal: () => void;
  startDate: string | null;
  endDate: string | null;
}

export default function CollectionAnalytics({
  collectionData,
  toggleModal,
  startDate,
  endDate,
}: StatsProps) {
  function dateIntervalFilter(_: any, index: number) {
    const entryDate = collectionData ? new Date(collectionData.evolutionOfConfigurationSpaceSize.dates[index]) : new Date();

    return entryDate >= new Date(startDate!) && entryDate <= new Date(endDate!);
  }

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
      {collectionData && collectionData.evolutionOfConfigurationSpaceSize ? (
        <LineChart
          width={500}
          height={300}
          series={[
            {
              data:
                (startDate && endDate
                  ? collectionData.evolutionOfConfigurationSpaceSize.values.filter(
                      dateIntervalFilter
                    )
                  : collectionData.evolutionOfConfigurationSpaceSize.values
                ).map((v: any) => (typeof v === 'number' ? parseFloat(v.toFixed(2)) : v)) ?? [],
              label: 'Average Configuration Space Size',
              area: false,
              showMark: collectionData.evolutionOfConfigurationSpaceSize.values.length <= 1,
            },
          ]}
          xAxis={[
            {
              scaleType: 'point',
              data: formatStringDates(
                startDate && endDate
                  ? collectionData.evolutionOfConfigurationSpaceSize.dates.filter(
                      dateIntervalFilter
                    )
                  : collectionData.evolutionOfConfigurationSpaceSize.dates
              ),
            },
          ]}
        />
      ) : (
        <Typography variant="body1" gutterBottom sx={{
          width: 500,
          height: 500,
          ...flex({})
        }}>
          No configuration space data available for this collection.
        </Typography>
      )}
      <Box>
        {collectionData && collectionData.evolutionOfAddOns ? (
          <LineChart
            width={500}
            height={300}
            series={[
              {
                data:
                  (startDate && endDate
                    ? collectionData.evolutionOfAddOns.values.filter(dateIntervalFilter)
                    : collectionData.evolutionOfAddOns.values
                  ).map((v: any) => (typeof v === 'number' ? parseFloat(v.toFixed(2)) : v)) ?? [],
                area: false,
                showMark: collectionData.evolutionOfAddOns.values.length <= 1,
                label: 'Average Number of AddOns',
              },
            ]}
            xAxis={[
              {
                scaleType: 'point',
                data: formatStringDates(
                  startDate && endDate
                    ? collectionData.evolutionOfAddOns.dates.filter(dateIntervalFilter)
                    : collectionData.evolutionOfAddOns.dates
                ),
              },
            ]}
          />
        ) : (
          <Typography variant="body1" gutterBottom sx={{
            width: 500,
            height: 500,
            ...flex({})
          }}>
            No add-ons data available for this collection.
          </Typography>
        )}
      </Box>
    </>
  );
}
