import { useEffect, useState } from 'react';
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
    setFilterValues({
      sort,
      sortBy,
      subscriptionRange,
      minPriceRange,
      maxPriceRange,
      selectedOwners,
    });
  };

  const handleClear = () => {
    setSort('asc');
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
  }, [textFilterValue, filterLimits, receivedOwners]);

  return (
    <div className="mt-[50px] w-full p-4">
      <h2 className="mb-5 text-center text-3xl font-semibold">Filters</h2>

      <div className="mb-3 flex flex-col gap-2">
        <label htmlFor="sort-by" className="text-sm font-medium text-slate-700">
          Sort By
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">None</option>
          <option value="pricingName">Pricing Name</option>
          <option value="configurationSpaceSize">Configuration Space Size</option>
          <option value="featuresCount">Features</option>
          <option value="usageLimitsCount">Usage Limits</option>
          <option value="plansCount">Plans</option>
          <option value="addonsCount">Add-Ons</option>
          <option value="minPrice">Min Price</option>
          <option value="maxPrice">Max price</option>
        </select>
      </div>

      {sortBy !== '' && (
        <div className="mb-3 flex flex-col gap-2">
          <label htmlFor="sort-order" className="text-sm font-medium text-slate-700">
            Sort Order
          </label>
          <select
            id="sort-order"
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      )}

      {filterLimits && (
        <SliderFilter
          label="Configuration Space Size"
          min={filterLimits.configurationSpaceSize.min}
          max={filterLimits.configurationSpaceSize.max}
          data={filterLimits.configurationSpaceSize.data}
          onChange={(value: number[]) => setSubscriptionRange(value)}
        />
      )}

      {filterLimits && (
        <SliderFilter
          label="Min Price (€)"
          min={filterLimits.minPrice.min}
          max={filterLimits.minPrice.max}
          data={filterLimits.minPrice.data}
          onChange={(value: number[]) => setMinPriceRange(value)}
        />
      )}

      {filterLimits && (
        <SliderFilter
          label="Max Price (€)"
          min={filterLimits.maxPrice.min}
          max={filterLimits.maxPrice.max}
          data={filterLimits.maxPrice.data}
          onChange={(value: number[]) => setMaxPriceRange(value)}
        />
      )}

      {textFilterValue !== '' && (
        <div className="mx-auto w-full max-w-[500px] p-4">
          <h3 className="mb-2 text-xl font-semibold">Owner</h3>
          {Object.entries(owners).map(([owner, count]) => (
            <label key={owner} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={selectedOwners.includes(owner)}
                onChange={() => handleOwnerChange(owner)}
                className="h-4 w-4"
              />
              <span>
                {owner} ({count})
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-evenly gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-400 px-4 py-2"
          onClick={handleClear}
        >
          Clear
        </button>
        <button
          type="button"
          className="rounded-md bg-sphere-primary-300 px-4 py-2 text-white hover:bg-sphere-primary-500"
          onClick={handleFilter}
        >
          Filter
        </button>
      </div>
    </div>
  );
}
