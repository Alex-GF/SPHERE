import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePricingCollectionsApi } from '../../../profile/api/pricingCollectionsApi';
import PricingCard from '../../components/pricing-card';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '../../../core/hooks/useRouter';
import { transitionDefault, staggerContainer, fadeInUp } from '../../../core/utils/motion-variants';
import type { Collection } from '../../types/collection';

type Tab = 'pricings' | 'analytics';

export default function CollectionCardPage() {
  const { ownerId, collectionName } = useParams<{ ownerId: string; collectionName: string }>();
  const router = useRouter();
  const { getCollectionByOwnerAndName, downloadCollection } = usePricingCollectionsApi();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pricings');
  const [sortAsc, setSortAsc] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!ownerId || !collectionName) return;
    setIsLoading(true);
    getCollectionByOwnerAndName(ownerId, collectionName)
      .then(data => setCollection(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [ownerId, collectionName]);

  const pricings = useMemo(() => {
    const list = collection?.data?.pricings ?? [];
    return [...list].sort((a: any, b: any) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [collection, sortAsc]);

  const analytics = collection?.analytics;
  const d = collection?.data;

  const handleDownload = async () => {
    if (!ownerId || !collectionName) return;
    setIsDownloading(true);
    try { await downloadCollection(ownerId, collectionName); } catch {}
    setIsDownloading(false);
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-tp-hairline border-t-tp-primary" /></div>;
  }

  return (
    <>
      <Helmet><title>SPHERE - {collectionName}</title></Helmet>

      <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={transitionDefault} className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-xs text-tp-steel">
            <button type="button" onClick={() => router.push('/pricings/collections')} className="cursor-pointer hover:text-tp-ink">Collections</button>
            <span>/</span>
            <span className="text-tp-ink">{collectionName}</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-normal text-tp-ink">{collectionName}</h1>
              <p className="mt-1 text-sm text-tp-steel">
                {collection?.organization?.displayName || collection?.organization?.name}
                {collection?.description && <span className="ml-1">· {collection.description}</span>}
              </p>
            </div>
            <button
              type="button" onClick={handleDownload} disabled={isDownloading}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 py-1.5 text-xs font-medium text-tp-ink transition-colors hover:bg-tp-surface disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {isDownloading ? 'Downloading...' : 'Download ZIP'}
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...transitionDefault, delay: 0.05 }} className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Pricings', value: String(pricings.length) },
            { label: 'Min price', value: d?.minPrice ? `$${d.minPrice.min.toFixed(2)} – $${d.minPrice.max.toFixed(2)}` : '—' },
            { label: 'Max price', value: d?.maxPrice ? `$${d.maxPrice.min.toFixed(2)} – $${d.maxPrice.max.toFixed(2)}` : '—' },
            { label: 'Config space', value: d?.configurationSpaceSize ? `${d.configurationSpaceSize.min.toLocaleString()} – ${d.configurationSpaceSize.max.toLocaleString()}` : '—' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-tp-hairline-soft bg-tp-canvas p-3">
              <p className="text-[11px] text-tp-steel">{s.label}</p>
              <p className="mt-0.5 truncate text-lg font-semibold text-tp-ink">{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-tp-hairline-soft">
          {([['pricings', 'Pricings'], ['analytics', 'Analytics']] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`relative cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors ${tab === key ? 'text-tp-primary' : 'text-tp-steel hover:text-tp-ink'}`}>
              {label}
              {tab === key && <motion.div layoutId="collection-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-tp-primary" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* PRICINGS TAB */}
          {tab === 'pricings' && (
            <motion.div key="pricings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={transitionDefault}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-tp-ink">{pricings.length} {pricings.length === 1 ? 'pricing' : 'pricings'} in collection</h2>
                <button
                  type="button" onClick={() => setSortAsc(!sortAsc)}
                  className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-tp-steel transition-colors hover:bg-tp-surface hover:text-tp-ink"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13-6.75L16.5 19m0 0L12 14.5m4.5 4.5V10.5" />
                  </svg>
                  {sortAsc ? 'A→Z' : 'Z→A'}
                </button>
              </div>

              {pricings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-tp-hairline-soft bg-tp-canvas py-16 text-center">
                  <p className="text-sm font-medium text-tp-ink">No pricings in this collection</p>
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pricings.map((p: any) => (
                    <motion.div key={`${p.name}-${p.version}`} variants={fadeInUp} transition={transitionDefault}>
                      <PricingCard data={p} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={transitionDefault} className="space-y-6">
              {analytics ? (
                <>
                  {/* Config Space Evolution */}
                  {analytics.evolutionOfConfigurationSpaceSize?.dates?.length > 0 && (
                    <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas p-5">
                      <h3 className="mb-4 text-sm font-medium text-tp-ink">Configuration Space Evolution</h3>
                      <div className="h-48">
                        <svg viewBox={`0 0 ${analytics.evolutionOfConfigurationSpaceSize.dates.length * 50 + 30} 180`} className="h-full w-full">
                          {analytics.evolutionOfConfigurationSpaceSize.dates.map((date, i) => {
                            const val = analytics.evolutionOfConfigurationSpaceSize.values[i] ?? 0;
                            const maxVal = Math.max(...analytics.evolutionOfConfigurationSpaceSize.values, 1);
                            const x = i * 50 + 20;
                            const h = (val / maxVal) * 140;
                            return (
                              <g key={i}>
                                <rect x={x} y={160 - h} width={32} height={h} fill="#fa520f" opacity={0.6} rx={4} />
                                <text x={x + 16} y={158 - h} textAnchor="middle" fill="#1f1f1f" fontSize={8} fontWeight={500}>{val.toLocaleString()}</text>
                                <text x={x + 16} y={172} textAnchor="middle" fill="#8a8a8a" fontSize={7}>{new Date(date).toLocaleDateString()}</text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Plans Evolution */}
                  {analytics.evolutionOfPlans?.dates?.length > 0 && (
                    <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas p-5">
                      <h3 className="mb-4 text-sm font-medium text-tp-ink">Plans Evolution</h3>
                      <div className="h-48">
                        <svg viewBox={`0 0 ${analytics.evolutionOfPlans.dates.length * 50 + 30} 180`} className="h-full w-full">
                          {analytics.evolutionOfPlans.dates.map((date, i) => {
                            const val = analytics.evolutionOfPlans.values[i] ?? 0;
                            const maxVal = Math.max(...analytics.evolutionOfPlans.values, 1);
                            const x = i * 50 + 20;
                            const h = (val / maxVal) * 140;
                            return (
                              <g key={i}>
                                <rect x={x} y={160 - h} width={32} height={h} fill="#ffa110" opacity={0.6} rx={4} />
                                <text x={x + 16} y={158 - h} textAnchor="middle" fill="#1f1f1f" fontSize={8} fontWeight={500}>{val}</text>
                                <text x={x + 16} y={172} textAnchor="middle" fill="#8a8a8a" fontSize={7}>{new Date(date).toLocaleDateString()}</text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Features Evolution */}
                  {analytics.evolutionOfFeatures?.dates?.length > 0 && (
                    <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas p-5">
                      <h3 className="mb-4 text-sm font-medium text-tp-ink">Features Evolution</h3>
                      <div className="h-48">
                        <svg viewBox={`0 0 ${analytics.evolutionOfFeatures.dates.length * 50 + 30} 180`} className="h-full w-full">
                          {analytics.evolutionOfFeatures.dates.map((date, i) => {
                            const val = analytics.evolutionOfFeatures.values[i] ?? 0;
                            const maxVal = Math.max(...analytics.evolutionOfFeatures.values, 1);
                            const x = i * 50 + 20;
                            const h = (val / maxVal) * 140;
                            return (
                              <g key={i}>
                                <rect x={x} y={160 - h} width={32} height={h} fill="#cc3a05" opacity={0.5} rx={4} />
                                <text x={x + 16} y={158 - h} textAnchor="middle" fill="#1f1f1f" fontSize={8} fontWeight={500}>{val}</text>
                                <text x={x + 16} y={172} textAnchor="middle" fill="#8a8a8a" fontSize={7}>{new Date(date).toLocaleDateString()}</text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Add-ons Evolution */}
                  {analytics.evolutionOfAddOns?.dates?.length > 0 && (
                    <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas p-5">
                      <h3 className="mb-4 text-sm font-medium text-tp-ink">Add-ons Evolution</h3>
                      <div className="h-48">
                        <svg viewBox={`0 0 ${analytics.evolutionOfAddOns.dates.length * 50 + 30} 180`} className="h-full w-full">
                          {analytics.evolutionOfAddOns.dates.map((date, i) => {
                            const val = analytics.evolutionOfAddOns.values[i] ?? 0;
                            const maxVal = Math.max(...analytics.evolutionOfAddOns.values, 1);
                            const x = i * 50 + 20;
                            const h = (val / maxVal) * 140;
                            return (
                              <g key={i}>
                                <rect x={x} y={160 - h} width={32} height={h} fill="#ff8105" opacity={0.5} rx={4} />
                                <text x={x + 16} y={158 - h} textAnchor="middle" fill="#1f1f1f" fontSize={8} fontWeight={500}>{val}</text>
                                <text x={x + 16} y={172} textAnchor="middle" fill="#8a8a8a" fontSize={7}>{new Date(date).toLocaleDateString()}</text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-tp-hairline-soft bg-tp-canvas py-16 text-center">
                  <p className="text-sm text-tp-steel">No analytics data available for this collection.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
