import { IoMdAddCircleOutline } from 'react-icons/io';
import { FaSortAlphaDown, FaSortAlphaUpAlt } from "react-icons/fa";
import { usePricingCollectionsApi } from '../../api/pricingCollectionsApi';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from '../../../core/hooks/useRouter';
import CollectionsGrid from '../collections-grid';
import AddPricingToCollectionModal from '../add-pricing-to-collection-modal';
import { useAuth } from '../../../auth/hooks/useAuth';

export default function CollectionSection({
  pricingToAdd,
  addPricingToCollectionModalOpen,
  setAddPricingToCollectionModalOpen,
  renderFlag,
  setRenderFlag
}: {
  pricingToAdd: string;
  addPricingToCollectionModalOpen: boolean;
  setAddPricingToCollectionModalOpen: (value: boolean) => void;
  renderFlag: boolean;
  setRenderFlag: (value: boolean) => void;
}) {
  const [collections, setCollections] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { getLoggedUserCollections } = usePricingCollectionsApi();
  const { authUser } = useAuth();
  const router = useRouter();

  function handleAddCollection() {
    router.push('/pricings/collections/new');
  }

  function handleAddPricingToCollectionModalClose() {
    setRenderFlag(!renderFlag);
    setAddPricingToCollectionModalOpen(false);
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
  };

  useEffect(() => {
    if (!authUser.isAuthenticated) {
      return;
    }
    getLoggedUserCollections()
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        } else if (data.collections) {
          setCollections(data.collections);
        }
      })
      .catch(error => {
        console.error('Cannot GET collections. Error:', error);
      });
  }, [renderFlag, authUser]);

  const sortedCollections = useMemo(() => {
    return [...collections].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }, [collections, sortOrder]);

  return (
    <>
      <div className="mb-4">
        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">
              Collections {collections.length > 0 && `(${collections.length})`}
            </h2>
            <button onClick={toggleSortOrder} type="button" className="ml-2 p-2">
              {sortOrder === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUpAlt />}
            </button>
          </div>
          <button type="button" className="p-2" onClick={handleAddCollection}>
            <IoMdAddCircleOutline />
          </button>
        </div>

        {/* List of collections */}
        <CollectionsGrid collections={sortedCollections} />
      </div>
      <AddPricingToCollectionModal
        pricingName={pricingToAdd}
        modalState={addPricingToCollectionModalOpen}
        handleClose={handleAddPricingToCollectionModalClose}
        collections={sortedCollections}
      />
    </>
  );
}