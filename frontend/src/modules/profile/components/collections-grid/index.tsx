import { CollectionEntry } from '../../types/profile-types';
import CollectionListCard from '../../../pricing/components/collection-list-card';
import { useRouter } from '../../../core/hooks/useRouter';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CollectionsGrid = forwardRef(
  (
    {
      collections,
      selector = false,
    }: {
      collections: CollectionEntry[];
      selector?: boolean;
    },
    ref
  ) => {
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

    useImperativeHandle(ref, () => {
      return {
        selectedCollection
      };
    });

    function handleSelect(collectionId: string) {
      setSelectedCollection(collectionId);
    }

    const router = useRouter();

    return (
      <div className="flex w-full justify-center">
        {collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection: CollectionEntry) => (
              <CollectionListCard
                key={uuidv4()}
                collection={collection}
                selected={selector ? selectedCollection === collection.id : false}
                handleCustomClick={selector ? () => handleSelect(collection.id) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center justify-center">
            <p className="mb-2 text-sm text-slate-700">
              You have no collections
            </p>
            <button
              type="button"
              className="rounded-md bg-sphere-primary-300 px-4 py-2 text-white"
              onClick={() => router.push('/pricings/collections/new')}
            >
              Create one!
            </button>
          </div>
        )}
      </div>
    );
  }
);

export default CollectionsGrid;