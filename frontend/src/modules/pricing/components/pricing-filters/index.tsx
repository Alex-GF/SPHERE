import { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';
import { primary } from '../../../core/theme/palette';
import SliderFilter from '../slider-filter';
import { FilterLimits } from '../../pages/list';

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

export default function PricingFilters({
  filterLimits,
  textFilterValue,
  setFilterValues,
}: {
  filterLimits: FilterLimits | null;
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
    if (filterLimits) {
      setSubscriptionRange([
        filterLimits.configurationSpaceSize.min,
        filterLimits.configurationSpaceSize.max,
      ]);
      setMinPriceRange([filterLimits.minPrice.min, filterLimits.minPrice.max]);
      setMaxPriceRange([filterLimits.maxPrice.min, filterLimits.maxPrice.max]);
    }
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
      {filterLimits && (
        <SliderFilter
          label="Configuration Space Size"
          min={filterLimits.configurationSpaceSize.min}
          max={filterLimits.configurationSpaceSize.max}
          data={filterLimits.configurationSpaceSize.data}
          onChange={(value: number[]) => setSubscriptionRange(value)}
        />
      )}

      {/* Filter: Min Price */}
      {filterLimits && (
        <SliderFilter
          label="Min Price"
          min={filterLimits.minPrice.min}
          max={filterLimits.minPrice.max}
          data={filterLimits.minPrice.data}
          onChange={(value: number[]) => setMinPriceRange(value)}
        />
      )}

      {/* Filter: Max Price */}
      {filterLimits && (
        <SliderFilter
          label="Max Price"
          min={filterLimits.maxPrice.min}
          max={filterLimits.maxPrice.max}
          data={filterLimits.maxPrice.data}
          onChange={(value: number[]) => setMaxPriceRange(value)}
        />
      )}

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
