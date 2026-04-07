import { PricingSearchResultItem } from '../sphere';
import { SphereContextItemInput } from '../types/types';
import PricingVersions from './PricingVersions';

interface PricingListProps {
  pricings: PricingSearchResultItem[];
  onContextAdd: (input: SphereContextItemInput) => void;
  onContextRemove: (id: string) => void;
}

function PricingsList({ pricings, onContextAdd, onContextRemove }: PricingListProps) {
  const generateKey = (pricing: PricingSearchResultItem) =>
    `${pricing.owner}-${pricing.name}-${pricing.version}-${pricing.collectionName ?? 'nocollection'}`;

  if (pricings.length === 0) {
    return <div>No pricings found</div>;
  }

  return (
    <div className="space-y-4">
      {pricings.map(item => (
        <div key={generateKey(item)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-lg font-semibold">
              {item.collectionName ? item.collectionName + '/' + item.name : item.name}
            </h3>
            <div className="text-sm font-semibold text-slate-600">Owned by: {item.owner}</div>
          </div>
          <PricingVersions
            owner={item.owner}
            name={item.name}
            collectionName={item.collectionName}
            onContextAdd={onContextAdd}
            onContextRemove={onContextRemove}
          />
        </div>
      ))}
    </div>
  );
}

export default PricingsList;
