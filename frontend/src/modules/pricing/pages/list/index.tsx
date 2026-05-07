import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import PricingListCard from '../../components/pricing-list-card';
import { usePricingsApi } from '../../api/pricingsApi';
import SearchBar from '../../components/search-bar';
import PricingFilters from '../../components/pricing-filters';
import PricingsPagination from '../../components/pricings-pagination';
import PricingsListContainer from '../../components/pricings-list-container';

export function PricingsGrid({ children }: { children: React.ReactNode }) {
  return <div className="mt-[50px] mb-[50px] flex w-full flex-wrap justify-evenly gap-12 px-2.5">{children}</div>;
}

export type PricingEntry = {
  name: string;
  organization: {
    id: string;
    name: string;
    displayName: string;
    avatar: string;
  };
  version: string;
  collectionName: string;
  createdAt: string;
  currency: string;
  analytics: {
    configurationSpaceSize: number;
    minSubscriptionPrice: number;
    maxSubscriptionPrice: number;
  };
};

export type FilterValues = {
  max: number;
  min: number;
  data: {
    value: string;
    count: number;
  }[];
};

export type FilterLimits = {
  [key: string]: FilterValues;
};

export default function PricingListPage() {
  const [pricingsList, setPricingsList] = useState<PricingEntry[]>([]);
  const [filterLimits, setFilterLimits] = useState<FilterLimits | null>(null);
  const [filterValues, setFilterValues] = useState({});
  const [textFilterValue, setTextFilterValue] = useState('');
  const [limit, setLimit] = useState<number>(12);
  const [offset, setOffset] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { getPricings } = usePricingsApi();
  // single effect handling initial load, filters and pagination
  useEffect(() => {
    const filters: Record<string, string | FilterValues | number | undefined> = {
      name: textFilterValue,
      ...filterValues,
    };

    getPricings({ ...filters, limit, offset })
      .then(data => {
        setPricingsList(data.pricings || []);
        if (typeof data.total === 'number') {
          setTotalCount(data.total);
        } else if (Array.isArray(data.pricings)) {
          setTotalCount(offset + data.pricings.length);
        }

        if (data.pricings && data.pricings.length > 0) {
          setFilterLimits({
            minPrice: data.minPrice,
            maxPrice: data.maxPrice,
            configurationSpaceSize: data.configurationSpaceSize,
            owners: data.pricings.map((pricing: PricingEntry) => pricing.organization),
          });
        } else {
          setFilterLimits({
            minPrice: { min: 0, max: 0, data: [] },
            maxPrice: { min: 0, max: 0, data: [] },
            configurationSpaceSize: { min: 0, max: 0, data: [] },
            owners: [],
          } as unknown as FilterLimits);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [textFilterValue, filterValues, limit, offset, getPricings]);

  return (
    <>
      <Helmet>
        <title> SPHERE - Pricings </title>
      </Helmet>
      <div className="flex h-full w-screen max-w-[2000px]">
        <div className="mx-auto flex h-full w-full max-w-[600px] flex-col justify-start border-r border-slate-300 bg-slate-100">
          <div className="w-[20vw]" />
            {filterLimits && (
            <PricingFilters
              filterLimits={filterLimits}
              receivedOwners={pricingsList.reduce((acc, pricing) => {
                acc[pricing.organization.name] = (acc[pricing.organization.name] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)}
              textFilterValue={textFilterValue}
              setFilterValues={setFilterValues}
            />
          )}
        </div>
        <div className="mt-[50px] flex grow flex-col">
          <SearchBar setTextFilterValue={setTextFilterValue} />
          <PricingsListContainer>
            <PricingsGrid>
              {pricingsList.length > 0 ? (
                Object.values(pricingsList).map(pricing => (
                  <PricingListCard
                    key={`pricing-${pricing.organization.id}-${pricing.collectionName}-${pricing.name}`}
                    name={pricing.name}
                    owner={pricing.organization.id}
                    dataEntry={pricing}
                  />
                ))
              ) : (
                <div>No pricings found</div>
              )}
            </PricingsGrid>

            <PricingsPagination
              limit={limit}
              offset={offset}
              total={totalCount}
              onChange={(newOffset: number, newLimit: number) => {
                setOffset(newOffset);
                setLimit(newLimit);
              }}
            />
          </PricingsListContainer>
        </div>
      </div>
    </>
  );
}
