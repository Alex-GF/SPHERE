import { motion } from 'framer-motion';
import Iconify from '../../../../core/components/iconify';
import { transitionDefault } from '../../../../core/utils/motion-variants';
import { OrgCollection } from '../../../api/organizationsApi';
import CollectionCard from '../../../../pricing/components/collection-card';
import Pagination from '../../../../pricing/components/pagination';
import { PER_PAGE } from '../types';

interface Props {
  collections: OrgCollection[];
  collectionsTotal: number;
  collectionPage: number;
  collectionSearch: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
}

export default function CollectionsTab({ collections, collectionsTotal, collectionPage, collectionSearch, onPageChange, onSearchChange }: Props) {
  return (
    <motion.div
      key="collections"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={transitionDefault}
    >
      <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas">
        <div className="flex flex-col gap-3 border-b border-tp-hairline-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg text-tp-ink">Collections</h2>
            <p className="text-xs text-tp-steel">Collections owned by this organization.</p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={collectionSearch}
              onChange={(e) => { onSearchChange(e.target.value); onPageChange(1); }}
              placeholder="Search collections..."
              className="h-9 w-full rounded-lg border border-tp-input-border bg-tp-input-bg px-3 text-sm text-tp-ink placeholder-tp-muted transition-colors focus:border-tp-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="min-h-105 p-4">
          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-tp-ink">
              <Iconify icon="mdi:folder-off-outline" width={32} />
              <p className="text-sm">No collections found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </div>

        {collectionsTotal > PER_PAGE && (
          <div className="border-t border-tp-hairline-soft px-5 py-3">
            <Pagination
              currentPage={collectionPage}
              totalPages={Math.ceil(collectionsTotal / PER_PAGE)}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
