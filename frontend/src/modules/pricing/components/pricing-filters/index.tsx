import { useEffect, useState } from 'react';
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
import { primary, palette } from '../../../core/theme/palette';
import SliderFilter from '../slider-filter';
import { FilterLimits } from '../../pages/list';

export default function PricingFilters({
  filterLimits,
  receivedOwners,
  textFilterValue,
  setFilterValues,
}: {
  filterLimits: FilterLimits;
  receivedOwners: Record<string, number>;
  textFilterValue: string;
  setFilterValues: Function;
}) {
  const [sort, setSort] = useState<string>('asc');
  const [sortBy, setSortBy] = useState<string>('');
  const [subscriptionRange, setSubscriptionRange] = useState<number[]>([
    filterLimits.configurationSpaceSize.min,
    filterLimits.configurationSpaceSize.max,
  ]);
  const [minPriceRange, setMinPriceRange] = useState<number[]>([
    filterLimits.minPrice.min,
    filterLimits.minPrice.max,
  ]);
  const [maxPriceRange, setMaxPriceRange] = useState<number[]>([
    filterLimits.maxPrice.min,
    filterLimits.maxPrice.max,
  ]);
  const [owners, setOwners] = useState<Record<string, number>>({});
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);

  const handleOwnerChange = (owner: string) => {
    setSelectedOwners(prev =>
      prev.includes(owner) ? prev.filter(o => o !== owner) : [...prev, owner]
    );
  };

  const handleFilter = () => {
    const filterValues = {
      sort,
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
    setSelectedOwners([]);
    setFilterValues({
      subscriptionRange: [0, Number.MAX_SAFE_INTEGER],
      minPriceRange: [0, Number.MAX_SAFE_INTEGER],
      maxPriceRange: [0, Number.MAX_SAFE_INTEGER],
    });
  };

  useEffect(() => {
    if (textFilterValue) {
      setOwners(receivedOwners);
    } else {
      setOwners({});
      setSelectedOwners([]);
    }
    if (filterLimits) {
      setSubscriptionRange([
        filterLimits.configurationSpaceSize.min,
        filterLimits.configurationSpaceSize.max,
      ]);
      setMinPriceRange([filterLimits.minPrice.min, filterLimits.minPrice.max]);
      setMaxPriceRange([filterLimits.maxPrice.min, filterLimits.maxPrice.max]);
    }
  }, [textFilterValue, filterLimits]);

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
            backgroundColor: `${palette().background.neutral}`,
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

      {/* Sort Order */}
      {sortBy !== '' && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel
            id="sort-order-label"
            sx={{
              backgroundColor: 'white',
              padding: '0 5px',
            }}
          >
            Sort Order
          </InputLabel>
          <Select labelId="sort-order-label" value={sort} onChange={e => setSort(e.target.value)}>
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      )}

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
          label="Min Price (€)"
          min={filterLimits.minPrice.min}
          max={filterLimits.minPrice.max}
          data={filterLimits.minPrice.data}
          onChange={(value: number[]) => setMinPriceRange(value)}
        />
      )}

      {/* Filter: Max Price */}
      {filterLimits && (
        <SliderFilter
          label="Max Price (€)"
          min={filterLimits.maxPrice.min}
          max={filterLimits.maxPrice.max}
          data={filterLimits.maxPrice.data}
          onChange={(value: number[]) => setMaxPriceRange(value)}
        />
      )}

      {/* Filter: Owners */}
      {textFilterValue !== '' && (
        <Box sx={{ width: '100%', padding: '16px', maxWidth: '500px', margin: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Owner
          </Typography>
          {Object.entries(owners).map(([owner, count]) => (
            <FormControlLabel
              key={owner}
              control={
                <Checkbox
                  checked={selectedOwners.includes(owner)}
                  onChange={() => handleOwnerChange(owner)}
                />
              }
              label={`${owner} (${count})`}
            />
          ))}
        </Box>
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
