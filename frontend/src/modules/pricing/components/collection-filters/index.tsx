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
      prev.includes(owner) ? prev.filter(entry => entry !== owner) : [...prev, owner]
    );
  };

  const handleFilter = () => {
    const ownersValue = selectedOwners.join(',');

    setFilterValues({
      sort,
      sortBy,
      owners: ownersValue,
    });
  };

  const handleClear = () => {
    setSort('asc');
    setSortBy('');
    setSelectedOwners([]);
    setFilterValues({});
  };

  useEffect(() => {
    if (textFilterValue) {
      setOwners(receivedOwners);
    } else {
      setOwners({});
      setSelectedOwners([]);
    }
  }, [textFilterValue, receivedOwners]);

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
          <option value="numberOfPricings">Number of Pricings</option>
          <option value="configurationSpaceSize">Configuration Space Size</option>
          <option value="numberOfFeatures">Number of Features</option>
          <option value="numberOfPlans">Number of Plans</option>
          <option value="numberOfAddOns">Number of Add-Ons</option>
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
              <span>{owner} ({count})</span>
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
