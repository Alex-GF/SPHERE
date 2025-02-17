import { IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { OpenInFull } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts';
import type { CollectionAnalytics } from '../../types/collection';
import { formatStringDates } from '../../../profile/utils/dates-util';
import { useEffect, useState } from 'react';

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
    const entryDate = new Date(collectionData.evolutionOfConfigurationSpaceSize.dates[index]);

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
      <LineChart
        width={500}
        height={300}
        series={[
          {
            data:
              (startDate && endDate
                ? collectionData.evolutionOfConfigurationSpaceSize.values.filter(dateIntervalFilter)
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
                ? collectionData.evolutionOfConfigurationSpaceSize.dates.filter(dateIntervalFilter)
                : collectionData.evolutionOfConfigurationSpaceSize.dates
            ),
          },
        ]}
      />
      <Box>
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
      </Box>
    </>
  );
}
