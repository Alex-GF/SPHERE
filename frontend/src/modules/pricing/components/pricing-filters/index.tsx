import { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';
import { primary } from '../../../core/theme/palette';
import SliderFilter from '../slider-filter';

// Tipo para los datos de los "dueños"
type Owner = {
  name: string;
  count: number;
};

const owners: Owner[] = [
  { name: 'John', count: 10 },
  { name: 'Doe', count: 5 },
  { name: 'Alice', count: 8 },
  { name: 'Bob', count: 3 },
];

// Datos de ejemplo para el histograma
const histogramData: { value: string; count: number }[] = [
  { value: '0-100', count: 50 },
  { value: '100-200', count: 80 },
  { value: '200-300', count: 120 },
  { value: '300-400', count: 60 },
  { value: '400-500', count: 40 },
  { value: '500-600', count: 30 },
  { value: '600-700', count: 20 },
  { value: '700-800', count: 10 },
  { value: '800-900', count: 5 },
  { value: '900-1000', count: 2 },
];

export default function PricingFilters({
  textFilterValue,
  setFilterValues,
}: {
  textFilterValue: string;
  setFilterValues: Function;
}) {
  const [sortBy, setSortBy] = useState<string>('');
  const [subscriptionRange, setSubscriptionRange] = useState<number[]>([0, 1000]);
  const [minPriceRange, setMinPriceRange] = useState<number[]>([0, 1000]);
  const [maxPriceRange, setMaxPriceRange] = useState<number[]>([0, 1000]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);

  const handleOwnerChange = (owner: string) => {
    setSelectedOwners(prev =>
      prev.includes(owner) ? prev.filter(o => o !== owner) : [...prev, owner]
    );
  };

  const handleFilter = () => {
    const filterValues = {
      sortBy,
      subscriptionRange,
      minPriceRange,
      maxPriceRange,
      selectedOwners,
    };

    setFilterValues(filterValues);
  };

  const handleClear = () => {
    setSortBy('');
    setSubscriptionRange([0, 100]);
    setMinPriceRange([0, 100]);
    setMaxPriceRange([0, 100]);
    setSelectedOwners([]);
  };

  return (
    <Box
      sx={{
        width: '100%',
        marginTop: '50px',
        padding: '16px',
      }}
    >
      <Typography variant="h4" gutterBottom textAlign="center" marginBottom={5}>
        Filters
      </Typography>

      {/* Sort By */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel
          id="sort-by-label"
          sx={{
            backgroundColor: 'white',
            padding: '0 5px',
          }}
        >
          Sort By
        </InputLabel>
        <Select labelId="sort-by-label" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <MenuItem value="">None</MenuItem>
          <MenuItem value="configurationSpaceSize">Configuration Space Size</MenuItem>
          <MenuItem value="featuresCount">Features</MenuItem>
          <MenuItem value="usageLimitsCount">Usage Limits</MenuItem>
          <MenuItem value="plansCount">Plans</MenuItem>
          <MenuItem value="addonsCount"> Add-Ons</MenuItem>
          <MenuItem value="minPrice">Min Price</MenuItem>
          <MenuItem value="maxPrice">Max price</MenuItem>
        </Select>
      </FormControl>

      {/* Filter: Configuration Space */}
      <SliderFilter
        label="Configuration Space Size"
        min={0}
        max={1000}
        data={histogramData}
        onChange={(value: number[]) => setSubscriptionRange(value)}
      />

      {/* Filter: Min Price */}
      <SliderFilter
        label="Min Price"
        min={0}
        max={1000}
        data={histogramData}
        onChange={(value: number[]) => setMinPriceRange(value)}
      />

      {/* Filter: Max Price */}
      <SliderFilter
        label="Max Price"
        min={0}
        max={1000}
        data={histogramData}
        onChange={(value: number[]) => setMaxPriceRange(value)}
      />

      {/* Filter: Owners */}
      {textFilterValue !== '' && (
        <>
          <Typography gutterBottom>Owner</Typography>
          {owners.map(owner => (
            <FormControlLabel
              key={owner.name}
              control={
                <Checkbox
                  checked={selectedOwners.includes(owner.name)}
                  onChange={() => handleOwnerChange(owner.name)}
                />
              }
              label={`${owner.name} (${owner.count})`}
            />
          ))}
        </>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', marginTop: '16px' }}>
        <Button variant="outlined" color="primary" onClick={handleClear}>
          Clear
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: primary[300], '&:hover': { backgroundColor: primary[500] } }}
          onClick={handleFilter}
        >
          Filter
        </Button>
      </Box>
    </Box>
  );
}
