import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePricingsApi } from '../../api/pricingsApi';
import customAlert from '../../../core/utils/custom-alert';
import BanterLoader from '../../../core/components/loaders/banter-loader';
import { FiChevronLeft, FiChevronRight, FiSearch, FiShuffle } from 'react-icons/fi';

export interface Configuration {
  selectedPlan?: string;
  selectedAddons: string[];
  subscriptionFeatures: string[];
  subscriptionUsageLimits: string[];
}

type IndexedConfiguration = Configuration & {
  id: string;
};

function normalizeConfiguration(input: Partial<Configuration>): Configuration {
  return {
    selectedPlan: input.selectedPlan,
    selectedAddons: Array.isArray(input.selectedAddons) ? input.selectedAddons : [],
    subscriptionFeatures: Array.isArray(input.subscriptionFeatures) ? input.subscriptionFeatures : [],
    subscriptionUsageLimits: Array.isArray(input.subscriptionUsageLimits)
      ? input.subscriptionUsageLimits
      : [],
  };
}

function summarizeConfiguration(configuration: IndexedConfiguration, index: number) {
  const plan = configuration.selectedPlan || 'No plan selected';
  return {
    index: index + 1,
    plan,
    addOnsCount: configuration.selectedAddons.length,
    featuresCount: configuration.subscriptionFeatures.length,
    usageLimitsCount: configuration.subscriptionUsageLimits.length,
  };
}

function compactList(values: string[], max = 7) {
  return values.length <= max ? values : values.slice(0, max);
}

const REQUEST_PAGE_SIZE = 200;
const QUICK_BROWSE_BATCH_SIZE = 120;

export default function ConfigurationSpaceView({ pricingId }: { pricingId: string }) {
  const [renderedConfigurationSpace, setRenderedConfigurationSpace] = useState<IndexedConfiguration[]>([]);
  const [renderedConfigurationSpaceSize, setRenderedConfigurationSpaceSize] = useState<number>(0);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('All plans');
  const [focusedConfigurationId, setFocusedConfigurationId] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState<boolean>(false);
  const [quickBrowseVisibleCount, setQuickBrowseVisibleCount] = useState<number>(QUICK_BROWSE_BATCH_SIZE);

  const { getConfigurationSpace } = usePricingsApi();
  const loaderRef = useRef<HTMLDivElement>(null);
  const idSequenceRef = useRef<number>(0);

  const availablePlans = useMemo(() => {
    const plans = new Set<string>();
    renderedConfigurationSpace.forEach((configuration) => {
      if (configuration.selectedPlan) {
        plans.add(configuration.selectedPlan);
      }
    });

    return ['All plans', 'No plan selected', ...Array.from(plans).sort((a, b) => a.localeCompare(b))];
  }, [renderedConfigurationSpace]);

  const filteredConfigurations = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return renderedConfigurationSpace.filter((configuration) => {
      const planLabel = configuration.selectedPlan || 'No plan selected';
      const matchesPlan =
        selectedPlan === 'All plans' ||
        (selectedPlan === 'No plan selected'
          ? !configuration.selectedPlan
          : configuration.selectedPlan === selectedPlan);

      if (!normalizedTerm) {
        return matchesPlan;
      }

      const searchableText = [
        planLabel,
        ...configuration.selectedAddons,
        ...configuration.subscriptionFeatures,
        ...configuration.subscriptionUsageLimits,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedTerm) && matchesPlan;
    });
  }, [renderedConfigurationSpace, searchTerm, selectedPlan]);

  const activeIndex = useMemo(
    () => filteredConfigurations.findIndex((configuration) => configuration.id === focusedConfigurationId),
    [filteredConfigurations, focusedConfigurationId]
  );

  const focusedConfiguration = useMemo(() => {
    if (!focusedConfigurationId) {
      return undefined;
    }

    return filteredConfigurations.find((configuration) => configuration.id === focusedConfigurationId);
  }, [filteredConfigurations, focusedConfigurationId]);
  useEffect(() => {
    let canceled = false;

    idSequenceRef.current = 0;
    setRenderedConfigurationSpace([]);
    setRenderedConfigurationSpaceSize(0);
    setShowAllFeatures(false);
    setQuickBrowseVisibleCount(QUICK_BROWSE_BATCH_SIZE);

    const preloadAllConfigurations = async () => {
      try {
        const allConfigurations: IndexedConfiguration[] = [];
        let total = 0;
        let currentOffset = 0;
        let keepFetching = true;

        while (keepFetching && !canceled) {
          const responseData = await getConfigurationSpace(pricingId, REQUEST_PAGE_SIZE, currentOffset);
          const rawChunk = (responseData?.configurationSpace as Partial<Configuration>[] | undefined) ?? [];

          if (currentOffset === 0) {
            total = Number(responseData?.configurationSpaceSize ?? rawChunk.length);
            setRenderedConfigurationSpaceSize(total);
          }

          const normalizedChunk: IndexedConfiguration[] = rawChunk.map((configuration) => ({
            ...normalizeConfiguration(configuration),
            id: `cfg-${idSequenceRef.current++}`,
          }));

          allConfigurations.push(...normalizedChunk);

          if (rawChunk.length === 0 || (total > 0 && allConfigurations.length >= total)) {
            keepFetching = false;
          } else {
            currentOffset += REQUEST_PAGE_SIZE;
          }
        }

        if (!canceled) {
          setRenderedConfigurationSpace(allConfigurations);
          if (total === 0) {
            setRenderedConfigurationSpaceSize(allConfigurations.length);
          }
        }
      } catch (error) {
        if (!canceled) {
          customAlert(`Error fetching configuration space: ${error}`);
        }
      } finally {
        if (!canceled) {
          setLoadingInitial(false);
        }
      }
    };

    preloadAllConfigurations();

    return () => {
      canceled = true;
    };
  // getConfigurationSpace can be recreated by context updates; keep preload tied to pricing changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingId]);

  useEffect(() => {
    if (filteredConfigurations.length === 0) {
      setFocusedConfigurationId(null);
      return;
    }

    if (!focusedConfigurationId || !filteredConfigurations.some((item) => item.id === focusedConfigurationId)) {
      setFocusedConfigurationId(filteredConfigurations[0].id);
    }
  }, [filteredConfigurations, focusedConfigurationId]);

  useEffect(() => {
    setShowAllFeatures(false);
  }, [focusedConfigurationId]);

  useEffect(() => {
    setQuickBrowseVisibleCount((previous) => {
      const nextValue = Math.min(Math.max(QUICK_BROWSE_BATCH_SIZE, previous), filteredConfigurations.length);
      return nextValue;
    });
  }, [filteredConfigurations.length]);

  const quickBrowseItems = useMemo(
    () => filteredConfigurations.slice(0, quickBrowseVisibleCount),
    [filteredConfigurations, quickBrowseVisibleCount]
  );

  const hasMoreQuickBrowseItems = quickBrowseVisibleCount < filteredConfigurations.length;

  useEffect(() => {
    if (!loaderRef.current) {
      return;
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loadingInitial && hasMoreQuickBrowseItems) {
        setQuickBrowseVisibleCount((previous) =>
          Math.min(previous + QUICK_BROWSE_BATCH_SIZE, filteredConfigurations.length)
        );
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1,
    });

    observer.observe(loaderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [filteredConfigurations.length, hasMoreQuickBrowseItems, loadingInitial]);

  const goToPrevious = () => {
    if (filteredConfigurations.length === 0 || activeIndex <= 0) {
      return;
    }
    setFocusedConfigurationId(filteredConfigurations[activeIndex - 1].id);
  };

  const goToNext = () => {
    if (
      filteredConfigurations.length === 0 ||
      activeIndex < 0 ||
      activeIndex >= filteredConfigurations.length - 1
    ) {
      return;
    }
    setFocusedConfigurationId(filteredConfigurations[activeIndex + 1].id);
  };

  const pickRandom = () => {
    if (filteredConfigurations.length === 0) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredConfigurations.length);
    setFocusedConfigurationId(filteredConfigurations[randomIndex].id);
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-4 p-2">
      {loadingInitial ? (
        <div className="mt-10 flex justify-center">
          <BanterLoader />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Configuration Explorer</h2>
                <p className="text-sm text-slate-500">Simple navigation through all possible configurations.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Loaded {renderedConfigurationSpace.length.toLocaleString()}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Total {renderedConfigurationSpaceSize.toLocaleString()}</span>
                <span className="rounded-full bg-[#d8edf4] px-3 py-1">Visible {filteredConfigurations.length.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
              <label className="rounded-lg border border-slate-200 bg-white p-3">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <FiSearch />
                  Search
                </span>
                <input
                  className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Plan, add-on, feature, usage limit"
                />
              </label>

              <label className="rounded-lg border border-slate-200 bg-white p-3">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Plan
                </span>
                <select
                  value={selectedPlan}
                  onChange={(event) => setSelectedPlan(event.target.value)}
                  className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                >
                  {availablePlans.map((plan) => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <AnimatePresence mode="wait">
                {focusedConfiguration ? (
                  <motion.div
                    key={focusedConfiguration.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current selection</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                          {focusedConfiguration.selectedPlan || 'No plan selected'}
                        </h3>
                      </div>
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                        #{Math.max(activeIndex + 1, 0)} of {filteredConfigurations.length.toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Add-ons</p>
                        <p className="text-sm font-semibold text-slate-800">{focusedConfiguration.selectedAddons.length}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Features</p>
                        <p className="text-sm font-semibold text-slate-800">{focusedConfiguration.subscriptionFeatures.length}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Usage limits</p>
                        <p className="text-sm font-semibold text-slate-800">{focusedConfiguration.subscriptionUsageLimits.length}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Selected add-ons</p>
                        <div className="flex flex-wrap gap-1.5">
                          {compactList(focusedConfiguration.selectedAddons).map((value) => (
                            <span key={value} className="rounded-full bg-[#d8edf4] px-2 py-1 text-xs text-slate-700">
                              {value}
                            </span>
                          ))}
                          {focusedConfiguration.selectedAddons.length === 0 && (
                            <span className="text-sm text-slate-500">No add-ons selected</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Usage limits</p>
                        <div className="flex flex-wrap gap-1.5">
                          {compactList(focusedConfiguration.subscriptionUsageLimits).map((value) => (
                            <span key={value} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                              {value}
                            </span>
                          ))}
                          {focusedConfiguration.subscriptionUsageLimits.length === 0 && (
                            <span className="text-sm text-slate-500">No usage limits</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Features preview</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(showAllFeatures
                          ? focusedConfiguration.subscriptionFeatures
                          : compactList(focusedConfiguration.subscriptionFeatures, 10)
                        ).map((value) => (
                          <span key={value} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                            {value}
                          </span>
                        ))}
                        {!showAllFeatures && focusedConfiguration.subscriptionFeatures.length > 10 && (
                          <button
                            type="button"
                            onClick={() => setShowAllFeatures(true)}
                            className="rounded-full border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
                          >
                            +{focusedConfiguration.subscriptionFeatures.length - 10} more
                          </button>
                        )}
                        {showAllFeatures && focusedConfiguration.subscriptionFeatures.length > 10 && (
                          <button
                            type="button"
                            onClick={() => setShowAllFeatures(false)}
                            className="rounded-full border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
                          >
                            Show less
                          </button>
                        )}
                        {focusedConfiguration.subscriptionFeatures.length === 0 && (
                          <span className="text-sm text-slate-500">No features</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-focus"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"
                  >
                    No configurations match this search.
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={activeIndex <= 0}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiChevronLeft />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={activeIndex < 0 || activeIndex >= filteredConfigurations.length - 1}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <FiChevronRight />
                </button>
                <button
                  type="button"
                  onClick={pickRandom}
                  disabled={filteredConfigurations.length === 0}
                  className="ml-auto inline-flex items-center gap-1 rounded-md border border-sphere-primary-500 bg-sphere-primary-500 px-3 py-2 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiShuffle />
                  Surprise me
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-3"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quick browse</h3>
            <p className="mt-1 text-xs text-slate-500">Infinite list over fully preloaded configurations.</p>

            <div className="mt-3 max-h-[66vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                {quickBrowseItems.map((configuration, idx) => {
                  const summary = summarizeConfiguration(configuration, idx);
                  const isFocused = focusedConfigurationId === configuration.id;

                  return (
                    <button
                      key={configuration.id}
                      type="button"
                      onClick={() => setFocusedConfigurationId(configuration.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition ${isFocused ? 'border-sphere-primary-400 bg-[#d8edf4]' : 'border-slate-200 bg-white hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-slate-800">{summary.plan}</p>
                        <p className="text-xs text-slate-500">#{summary.index}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {summary.addOnsCount} add-ons • {summary.featuresCount} features • {summary.usageLimitsCount} usage limits
                      </p>
                    </button>
                  );
                })}

                {filteredConfigurations.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                    No results.
                  </div>
                )}
              </div>

              <div ref={loaderRef} className="mt-4 flex min-h-10 items-center justify-center">
                {hasMoreQuickBrowseItems ? (
                  <p className="text-xs text-slate-400">Scroll to load more in quick browse</p>
                ) : (
                  <p className="text-xs text-slate-400">All filtered configurations are visible</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
