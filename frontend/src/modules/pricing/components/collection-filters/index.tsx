import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { palette, primary } from '../../../core/theme/palette';
import { useEffect, useState } from 'react';

export default function CollectionFilters({
  receivedOwners,
  textFilterValue,
  setFilterValues,
}: {
  receivedOwners: Record<string, number>;
  textFilterValue: string;
  setFilterValues: Function;
}) {
  const [sort, setSort] = useState<string>('asc');
  const [sortBy, setSortBy] = useState<string>('');

  const [owners, setOwners] = useState<Record<string, number>>({});
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);

  const handleOwnerChange = (owner: string) => {
    setSelectedOwners(prev =>
      prev.includes(owner) ? prev.filter(o => o !== owner) : [...prev, owner]
    );
  };

  const handleFilter = () => {
    const owners = selectedOwners.join(',');
    
    const filterValues = {
      sort,
      sortBy,
      owners,
    };
    setFilterValues(filterValues);
  };

  const handleClear = () => {
    setSortBy('');
    setSelectedOwners([]);
  };

  useEffect(() => {
    if (textFilterValue) {
      setOwners(receivedOwners);
    } else {
      setOwners({});
      setSelectedOwners([]);
    }
  }, [textFilterValue]);

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
          <MenuItem value="numberOfPricings">Number of Pricings</MenuItem>
          <MenuItem value="configurationSpaceSize">Configuration Space Size</MenuItem>
          <MenuItem value="numberOfFeatures">Number of Features</MenuItem>
          <MenuItem value="numberOfPlans">Number of Plans</MenuItem>
          <MenuItem value="numberOfAddOns"> Number of Add-Ons</MenuItem>
        </Select>
      </FormControl>

      {/* Sort Order */}
      {sortBy !== '' && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel
            id="sort-order-label"
            sx={{
              backgroundColor: `${palette().background.neutral}`,
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
