import CollectionsGrid from '../collections-grid';
import { CollectionEntry } from '../../types/profile-types';
import { useRef } from 'react';
import { usePricingsApi } from '../../../pricing/api/pricingsApi';
import customAlert from '../../../core/utils/custom-alert';

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
  const collectionSelector = useRef(null);

  const {addPricingToCollection} = usePricingsApi();

  function handleAddPricingToCollection() {
    const selectedCollection = (
      collectionSelector.current! as { selectedCollection: string | null }
    ).selectedCollection;
    
    addPricingToCollection(pricingName, selectedCollection!)
      .then(() => {
        handleClose();
        customAlert(`${pricingName} added to collection`);
        // window.location.reload();
      }).catch((error) => {
        console.error(error);
      });
  }

  return (
    modalState ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
        onClick={handleClose}
        role="presentation"
        aria-labelledby="modal-import-title"
        aria-describedby="modal-import-description"
      >
      <div
        className="mt-4 flex w-[90dvw] max-w-[2000px] flex-col rounded-[20px] bg-white p-4 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Select a collection to save the pricing</h2>
        <CollectionsGrid collections={collections} selector ref={collectionSelector} />
        <button
          type="button"
          className="mt-2 rounded-md bg-sphere-primary-700 px-4 py-2 text-white"
          onClick={handleAddPricingToCollection}
        >
          Save
        </button>
      </div>
    </div>
    ) : null
  );
}
