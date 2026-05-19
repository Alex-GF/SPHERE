import { useCallback, useMemo, useState } from 'react';
import {
  addRecentPricing as addRecentPricingUtil,
  addRecentCollection as addRecentCollectionUtil,
  getRecentPricings as getRecentPricingsUtil,
  getRecentCollections as getRecentCollectionsUtil,
  type RecentItem,
} from '../utils/recentItems';

export type { RecentItem };

export function useRecentItems() {
  const [recentPricings, setRecentPricings] = useState<RecentItem[]>(() => getRecentPricingsUtil());
  const [recentCollections, setRecentCollections] = useState<RecentItem[]>(() => getRecentCollectionsUtil());

  const addRecentPricing = useCallback((item: Omit<RecentItem, 'visitedAt'>) => {
    addRecentPricingUtil(item);
    setRecentPricings(getRecentPricingsUtil());
  }, []);

  const addRecentCollection = useCallback((item: Omit<RecentItem, 'visitedAt'>) => {
    addRecentCollectionUtil(item);
    setRecentCollections(getRecentCollectionsUtil());
  }, []);

  return useMemo(() => ({
    recentPricings,
    recentCollections,
    addRecentPricing,
    addRecentCollection,
  }), [recentPricings, recentCollections, addRecentPricing, addRecentCollection]);
}
