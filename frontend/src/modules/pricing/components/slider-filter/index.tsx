import { useState } from 'react';
import { Box, Slider, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { grey, primary } from '../../../core/theme/palette';

export default function SliderFilter({
  label,
  min,
  max,
  data,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  data: { value: string; count: number }[];
  onChange: Function;
}) {
  const [range, setRange] = useState<number[]>([min, max]);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    onChange(newValue as number[]);
    setRange(newValue as number[]);
  };

  return (
    <Box sx={{ width: '100%', padding: '16px', maxWidth: '500px', margin: 'auto' }}>
      {/* Título */}
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>

      {/* Histograma */}
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data}>
          <XAxis dataKey="value" hide />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="count" fill={grey[400]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Slider con valores */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="body2">{`Min: ${range[0]}`}</Typography>
        <Typography variant="body2">{`Max: ${range[1]}`}</Typography>
      </Box>
      <Slider
        value={range}
        onChange={handleSliderChange}
        min={min}
        max={max}
        valueLabelDisplay="auto"
        sx={{
          mt: 2,
          color: primary[500],
          '& .MuiSlider-thumb': {
            backgroundColor: primary[500],
          },
          '& .MuiSlider-track': {
            backgroundColor: primary[500],
          },
          '& .MuiSlider-rail': {
            opacity: 0.5,
            backgroundColor: primary[500],
          },
        }}
      />
    </Box>
  );
}
