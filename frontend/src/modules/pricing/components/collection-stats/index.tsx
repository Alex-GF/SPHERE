import { Collection } from '../../types/collection';

interface StatsProps {
  readonly collection: Collection | undefined;
}

export default function CollectionStats({ collection }: StatsProps) {
  const collectionPricings = collection?.data?.pricings ?? [];

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="mb-2 text-xl font-semibold">
          Stats
        </h3>
      </div>
      <div className="mt-2 flex items-center justify-evenly gap-4">
        <div className="flex flex-col items-center justify-center text-center">
          {collectionPricings.length > 0 ? (
            <>
              <p>
                {collectionPricings.length}
              </p>
              <p className="text-sm text-slate-500">
                pricings
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                No data available
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
