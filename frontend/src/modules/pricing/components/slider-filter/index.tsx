import { useEffect, useState } from 'react';
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
  const [marks, setMarks] = useState(data.map(d => d.value));
  const [range, setRange] = useState<number[]>([0, max]);
  const [activeThumb, setActiveThumb] = useState<number>(0); // Tracks the active thump (0 = left, 1 = right)

  const calculateInterval = () => {
    const selectedMarks = marks.filter(value => {
      const numericValue = parseFloat(value.replace('+', ''));
      return numericValue >= range[0] && numericValue <= range[1];
    });
    
    if(selectedMarks.length === 0) return `${min} — ${max}`;

    const lowerLimit = selectedMarks[0].split('-')[0];
    const upperLimit = selectedMarks[selectedMarks.length - 1].split('-')[1] || `${selectedMarks[selectedMarks.length - 1]}`;

    return `${lowerLimit} — ${upperLimit}`;
  };

  const handleSliderChange = (event: Event, newValue: number | number[], thumbIndex: number) => {
    let [start, end] = newValue as number[];

    // Ajustar el rango a las marcas más cercanas
    const nearestStart = marks.reduce((prev, curr) =>
      Math.abs(parseFloat(curr.replace('+', '')) - start) < Math.abs(parseFloat(prev.replace('+', '')) - start)
        ? curr
        : prev
    );
    let nearestEnd: string | undefined = marks.reduce((prev, curr) =>
      Math.abs(parseFloat(curr.replace('+', '')) - end) < Math.abs(parseFloat(prev.replace('+', '')) - end)
        ? curr
        : prev
    );

    onChange([parseFloat(nearestStart.replace('+', '')), undefined]);
    setRange([parseFloat(nearestStart.replace('+', '')), parseFloat(nearestEnd.replace('+', ''))]);
    setActiveThumb(thumbIndex);
  };

  useEffect(() => {
    setMarks(data.map(d => d.value));
    setRange([range[0], max]);
  }, [data])

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
          <Tooltip 
          labelFormatter={(value: string) => `[${value}]`}
            formatter={(value: string) => `${value} pricings`}
            itemStyle={{color: grey[900]}}
          />
          <Bar dataKey="count" fill={grey[400]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Intervalo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Typography variant="body2" sx={{
          fontSize: '15px',
          fontWeight: "bold",
        }}>{calculateInterval()}</Typography>
      </Box>

      {/* Slider */}
      <Slider
        value={range}
        onChange={handleSliderChange}
        min={0}
        max={marks.length > 0 ? parseFloat(marks[marks.length - 1].replace('+', '')) : max}
        step={null} // No pasos intermedios
        marks={marks.map(value => ({
          value: parseFloat(value.replace('+', ''))
        }))}
        valueLabelDisplay="off"
        valueLabelFormat={value => {
            if (activeThumb === 0) {
              // Tooltip min
              return marks.find(mark => parseFloat(mark.replace('+', '')) === value)?.split('-')[0] || `${value}`;
            } else if (activeThumb === 1) {
              // Tooltip max
              return marks.find(mark => parseFloat(mark.replace('+', '')) === value)?.split('-')[1] || `${value}`;
            }
            return `${value}`; // Fallback
        }
        }
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