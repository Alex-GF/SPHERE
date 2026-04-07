import { ChangeEvent, useState } from 'react';
import { usePricings } from '../hooks/usePricings';
import { SphereContextItemInput } from '../types/types';
import PricingsList from './PricingList';

interface SearchPricingsProps {
  onContextAdd: (input: SphereContextItemInput) => void;
  onContextRemove: (id: string) => void;
}

function SearchPricings({ onContextAdd, onContextRemove }: SearchPricingsProps) {
  const [search, setSearch] = useState<string>('');
  const [offset, setOffset] = useState<number>(0);
  const limit = 10;
  const { loading, error, pricings: result } = usePricings(search, offset, limit);

  const currentPage = offset / limit + 1;
  const totalPages = Math.ceil(result.total / limit);

  function handleSeachChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.currentTarget.value);
    setOffset(0);
  }

  const handlePaginationChange = (page: number) =>
    setOffset((page - 1) * limit);

  if (error) {
    return <div>Something went wrong...</div>;
  }

  const hasResults = result.pricings.length > 0;

  return (
    <section className="space-y-4">
      <input
        aria-label="Pricing name"
        placeholder="Pricing name"
        onChange={handleSeachChange}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      {!loading ? (
        <>
          <span className="inline-flex rounded-full border border-sky-300 px-3 py-1 text-sm text-sky-700">
            {result.total} results
          </span>

          <PricingsList
            pricings={result.pricings}
            onContextAdd={onContextAdd}
            onContextRemove={onContextRemove}
          />
        </>
      ) : (
        <div className="h-[1200px] w-full animate-pulse rounded-2xl bg-slate-100" />
      )}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasResults || currentPage <= 1}
          onClick={() => handlePaginationChange(currentPage - 1)}
        >
          Previous
        </button>
        <span className="text-sm text-slate-600">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasResults || currentPage >= totalPages}
          onClick={() => handlePaginationChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default SearchPricings;
