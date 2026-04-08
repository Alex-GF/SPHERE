import { FaFolder } from 'react-icons/fa';
import { useRouter } from '../../../core/hooks/useRouter';
import { CollectionEntry } from '../../../profile/types/profile-types';

export default function CollectionListCard({
  collection,
  selected = false,
  handleCustomClick,
}: {
  collection: CollectionEntry;
  selected?: boolean;
  handleCustomClick?: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className={`flex items-center w-[200px] cursor-pointer flex-col rounded-lg p-2 ${selected ? 'border-2 border-sphere-primary-400' : 'border border-[#ddd]'}`}
      key={`collection-${collection.name}`}
      onClick={
        handleCustomClick
          ? handleCustomClick
          : () => router.push(`/pricings/collections/${collection.owner.id}/${collection.name}`)
      }
    >
      <FaFolder fontSize={100} />
      <p className="text-base font-medium">{collection.name}</p>
      <p className="text-sm text-slate-500">
        {collection.numberOfPricings} pricings
        {/* · Updated Jun 29, 2023 · 105 descargas */}
      </p>
    </div>
  );
}
