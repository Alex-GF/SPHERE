import { Helmet } from 'react-helmet';
import { useEffect, useState, useMemo } from 'react';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from 'react-icons/fa6';
import { usePathname } from '../../../core/hooks/usePathname';
import { useRouter } from '../../../core/hooks/useRouter';
import CollectionStats from '../../components/collection-stats';
import CollectionAnalytics from '../../components/collection-analytics';
import CollectionAnalyticsModal from '../../components/collection-analytics-modal';
import { usePricingCollectionsApi } from '../../../profile/api/pricingCollectionsApi';
import { Collection } from '../../types/collection';
import type { PricingEntry } from '../list';
import PricingListCard from '../../../pricing/components/pricing-list-card';
import { useAuth } from '../../../auth/hooks/useAuth';
import CollectionSettings from '../../components/collection-settings';
import { FaSortAlphaDown, FaSortAlphaUpAlt } from 'react-icons/fa';
import type { AnalyticsDataEntry } from '../../../../assets/data/analytics';

export default function CollectionCardPage() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collection, setCollection] = useState<Collection | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | null>(new Date().toISOString());
  const [endDate, setEndDate] = useState<string | null>(new Date().toISOString());
  const [tabValue, setTabValue] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const pathname = usePathname();
  const { getCollectionByOwnerAndName, downloadCollection } = usePricingCollectionsApi();
  const router = useRouter();
  const { authUser } = useAuth();

  useEffect(() => {
    const segments = pathname.split('/');
    const name = segments.pop() as string;
    const ownerId = segments[segments.length - 1];

    getCollectionByOwnerAndName(ownerId, name)
      .then(collection => {
        if (collection) {
          setCollection(collection);
          if (collection.analytics) {
            setStartDate(collection.analytics.evolutionOfPlans.dates[0]);
            setEndDate(
              collection.analytics.evolutionOfPlans.dates[
                collection.analytics.evolutionOfPlans.dates.length - 1
              ]
            );
          }
        } else {
          router.push('/error');
        }
      })
      .catch(error => {
        console.log(error);
        // router.push('/error');
      });
  }, [pathname, router, getCollectionByOwnerAndName]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInputDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(e.target.value).toISOString());
  };

  const handleOutputDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(new Date(e.target.value).toISOString());
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedPricings = useMemo<PricingEntry[]>(() => {
    if (!collection || !collection.pricings || collection.pricings.length === 0) {
      return [];
    }
    // Convertir el objeto a un array
    const pricingArray: PricingEntry[] = (collection.pricings[0].pricings as AnalyticsDataEntry[]).map(pricing => ({
      ...pricing,
      owner: pricing.owner.username,
    })) as PricingEntry[];
    return pricingArray.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }, [collection, sortOrder]);

  return (
    <>
      <Helmet>
        <title>{`SPHERE - ${collection?.name} Collection`}</title>
      </Helmet>
      <div className="mx-auto my-4 w-full max-w-screen-xl px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 mt-6">
              <h1 className="text-2xl tracking-wide">
                {collection?.name}
              </h1>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1 text-sm"
                onClick={() => setIsLiked(!isLiked)}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                {isLiked ? '151' : '150'}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1 text-sm"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? <FaBookmark /> : <FaRegBookmark />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            <div>
              <div className="flex gap-6 my-6">
                <button
                  type="button"
                  className={`border-b-2 px-0 pb-2 pt-1 text-sm uppercase tracking-wide ${tabValue === 0 ? 'border-sphere-primary-500 text-sphere-primary-500' : 'border-slate-300 text-slate-500'}`}
                  onClick={() => setTabValue(0)}
                >
                  Collection Card
                </button>
                {collection && authUser.user && collection.owner.username === authUser.user.username && (
                  <button
                    type="button"
                    className={`border-b-2 px-0 pb-2 pt-1 text-sm uppercase tracking-wide ${tabValue === 1 ? 'border-sphere-primary-500 text-sphere-primary-500' : 'border-slate-300 text-slate-500'}`}
                    onClick={() => setTabValue(1)}
                  >
                    Settings
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              {collection && collection.analytics && collection.analytics.evolutionOfPlans.dates.length > 0 && (
                <>
                  <label className="relative min-w-[170px] rounded-md border border-slate-300 bg-slate-50 px-3 pb-2 pt-4 transition-colors focus-within:border-sphere-primary-500">
                    <span className="absolute left-3 top-0 -translate-y-1/2 bg-[#F9FAFB] px-1 text-[16px] text-slate-500">
                      Start Date
                    </span>
                    <input
                      type="date"
                      className="w-full border-0 bg-transparent p-0 text-center text-slate-700 outline-none"
                      defaultValue={new Date(collection.analytics.evolutionOfPlans.dates[0]).toISOString().split('T')[0]}
                      onChange={handleInputDate}
                    />
                  </label>
                  <label className="relative min-w-[170px] rounded-md border border-slate-300 bg-slate-50 px-3 pb-2 pt-4 transition-colors focus-within:border-sphere-primary-500">
                    <span className="absolute left-3 top-0 -translate-y-1/2 bg-[#F9FAFB] px-1 text-[16px] text-slate-500">
                      End Date
                    </span>
                    <input
                      type="date"
                      className="w-full border-0 bg-transparent p-0 text-center text-slate-700 outline-none"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      onChange={handleOutputDate}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          {tabValue === 1 && collection && (
            <CollectionSettings collection={collection} updateCollectionMethod={setCollection} />
          )}
          {tabValue === 0 && (
            <>
              <div className="flex-1 max-w-[66.7%]">
                <h2 className="mb-2 text-xl font-bold">
                  Description
                </h2>
                <p className="mb-4 text-justify">
                  {collection?.description
                    ? collection.description
                    : 'This collection has no description.'}
                </p>
                {collection && (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <h2 className="text-xl font-bold">
                          Pricings in Collection
                        </h2>
                        <button type="button" className="ml-2 rounded-full p-2" onClick={toggleSortOrder}>
                          {sortOrder === 'asc' ? <FaSortAlphaDown size={25} color="#637381"/> : <FaSortAlphaUpAlt size={25} color="#637381"/>}
                        </button>
                      </div>
                      <button
                        type="button"
                        className="h-10 w-[150px] rounded-md border border-sphere-primary-400 text-base font-bold text-sphere-primary-400 hover:bg-sphere-primary-400 hover:text-white"
                        onClick={() =>
                          downloadCollection(
                            collection?.owner.id as string,
                            collection?.name as string
                          )
                        }
                      >
                        DOWNLOAD
                      </button>
                    </div>
                    <div className="h-full max-h-[800px] overflow-y-scroll rounded-[10px] border border-slate-200 py-5">
                      {sortedPricings.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-6 px-3">
                          {sortedPricings.map((pricing) => {
                            const ownerName = pricing.owner || '';
                            return (
                              <PricingListCard
                                key={pricing.name}
                                name={pricing.name}
                                owner={ownerName}
                                dataEntry={pricing}
                                showOptions
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2">
                          NO PRICINGS FOUND
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-4 py-2"
                            onClick={() => router.push('/me/pricings')}
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="min-w-[33.3%]">
                <div className="mb-2 rounded border border-slate-200 p-2">
                  <CollectionStats collection={collection} />
                </div>

                {collection && (
                  <div className="mb-2 rounded border border-slate-200 p-2">
                    <CollectionAnalytics
                      collectionData={collection.analytics}
                      toggleModal={toggleModal}
                      startDate={startDate}
                      endDate={endDate}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {collection && (
        <CollectionAnalyticsModal
          open={isModalOpen}
          onClose={toggleModal}
          collectionData={collection.analytics}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </>
  );
}
