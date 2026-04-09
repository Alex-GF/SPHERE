import CollectionsGrid from '../collections-grid';
import { CollectionEntry } from '../../types/profile-types';
import { useRef } from 'react';
import { usePricingsApi } from '../../../pricing/api/pricingsApi';
import customAlert from '../../../core/utils/custom-alert';
import { AnimatePresence, motion } from 'framer-motion';

export default function AddPricingToCollectionModal({
  pricingName,
  modalState,
  handleClose,
  collections,
}: {
  pricingName: string;
  modalState: boolean;
  handleClose: () => void;
  collections: CollectionEntry[];
}) {
  const collectionSelector = useRef<{ selectedCollection: string | null } | null>(null);

  const { addPricingToCollection } = usePricingsApi();

  function handleAddPricingToCollection() {
    const selectedCollection = collectionSelector.current?.selectedCollection;

    if (!selectedCollection) {
      customAlert('Please select a collection first');
      return;
    }

    addPricingToCollection(pricingName, selectedCollection)
      .then(() => {
        handleClose();
        customAlert(`${pricingName} added to collection`);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <AnimatePresence>
      {modalState && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-[2px]"
          onClick={handleClose}
          role="presentation"
          aria-labelledby="modal-import-title"
          aria-describedby="modal-import-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <motion.div
            className="flex w-[95dvw] max-w-[1200px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_26px_70px_rgba(15,23,42,0.35)]"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <div className="border-b border-slate-200 bg-gradient-to-r from-sphere-primary-50 to-white px-6 py-5 sm:px-8">
              <h2 id="modal-import-title" className="text-xl font-bold text-slate-800 sm:text-2xl">
                Add Pricing To Collection
              </h2>
              <p id="modal-import-description" className="mt-1 text-sm text-slate-600 sm:text-base">
                Select one collection and save {pricingName} into it.
              </p>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-4 py-5 sm:px-6">
              <CollectionsGrid collections={collections} selector ref={collectionSelector} />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                onClick={handleAddPricingToCollection}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-lg bg-sphere-primary-700 px-5 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(2,62,138,0.3)] transition hover:bg-sphere-primary-800"
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
