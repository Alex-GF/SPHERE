import { Helmet } from 'react-helmet';
import { useEffect, useMemo, useRef, useState } from 'react';
import SearchBar from '../../components/search-bar';
import { usePricingCollectionsApi } from '../../../profile/api/pricingCollectionsApi';
import CollectionListCard from '../../components/collection-list-card';
import { CollectionEntry } from '../../../profile/types/profile-types';
import CollectionFilters from '../../components/collection-filters';
import PricingsPagination from '../../components/pricings-pagination';
import PricingsListContainer from '../../components/pricings-list-container';

export type PricingEntry = {
  name: string;
  organization: {
    id: string;
    name: string;
    displayName: string;
    avatar: string;
  };
  version: string;
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

export default function CollectionsListPage() {
  const [collectionsList, setCollectionsList] = useState<CollectionEntry[]>([]);
  const [filterLimits, setFilterLimits] = useState<FilterLimits | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string | number>>({});
  const [textFilterValue, setTextFilterValue] = useState('');
  const [limit, setLimit] = useState<number>(12);
  const [offset, setOffset] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { getCollections } = usePricingCollectionsApi();
  const getCollectionsRef = useRef(getCollections);

  useEffect(() => {
    getCollectionsRef.current = getCollections;
  }, [getCollections]);

  const filters = useMemo(
    () => ({
      name: textFilterValue,
      ...filterValues,
      limit,
      offset,
    }),
    [textFilterValue, filterValues, limit, offset]
  );

  const receivedOwners = useMemo(
    () =>
      collectionsList.reduce((acc, collection) => {
        acc[collection.organization.name] = (acc[collection.organization.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    [collectionsList]
  );

  useEffect(() => {
    let isActive = true;

    getCollectionsRef.current(filters)
      .then(data => {
        if (!isActive) {
          return;
        }

        setCollectionsList(data.collections);
        setTotalCount(data.total || 0);

        setFilterLimits(
          data.collections.length > 0
            ? {
                owners: data.collections.map((collection: CollectionEntry) => collection.organization),
              }
            : null
        );
      })
      .catch(error => {
        console.error('Error:', error);
      });

    return () => {
      isActive = false;
    };
  }, [filters]);

  return (
    <>
      <Helmet>
        <title> SPHERE - Collections </title>
      </Helmet>
      <div className="flex h-full w-screen max-w-[2000px]">
        <div className="mx-auto flex h-full w-full max-w-[600px] flex-col justify-start border-r border-slate-300 bg-slate-100">
          <div className="w-[20vw]" />
          {filterLimits && collectionsList.length > 0 && (
            <CollectionFilters
              receivedOwners={receivedOwners}
              textFilterValue={textFilterValue}
              setFilterValues={setFilterValues}
            />
          )}
        </div>
        <div className="mt-[50px] flex grow flex-col">
          <SearchBar setTextFilterValue={setTextFilterValue} />
          <PricingsListContainer>
            <div className="mt-[50px] mb-[50px] flex w-full flex-wrap justify-evenly gap-12 px-2.5">
              {collectionsList.length > 0 ? (
                collectionsList.map(collection => (
                  <CollectionListCard key={collection.id} collection={collection} />
                ))
              ) : (
                <div>No collections found</div>
              )}
            </div>

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
