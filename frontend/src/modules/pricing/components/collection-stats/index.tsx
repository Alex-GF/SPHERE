import { formatDistanceToNow, parseISO } from 'date-fns';
import { CURRENCIES } from '../../pages/card';
import { Collection } from '../../types/collection';

interface StatsProps {
  readonly collection: Collection | undefined;
}

export const getCurrency = (currency: string) => {
  const parsedCurrency = currency as keyof typeof CURRENCIES;
  return currency in CURRENCIES ? CURRENCIES[parsedCurrency] : CURRENCIES['USD'];
};

export default function CollectionStats({ collection }: StatsProps) {
  const collectionPricings = collection?.data?.pricings ?? collection?.pricings?.[0]?.pricings ?? [];

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
              {collection && collection.lastUpdate ? formatDistanceToNow(parseISO(collection.lastUpdate)) + ' ago' : NaN}
              <p className="text-sm text-slate-500">
                last updated
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
