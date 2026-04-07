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
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="mb-2 text-xl font-semibold">
          Stats
        </h3>
      </div>
      <div className="mt-2 flex items-center justify-evenly gap-4">
        <div className="flex flex-col items-center justify-center text-center">
          {collection?.pricings[0].pricings && collection?.pricings[0].pricings.length > 0 ? (
            <>
              {formatDistanceToNow(parseISO(collection.lastUpdate))} ago
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
          {collection?.pricings[0].pricings && collection?.pricings[0].pricings.length > 0 ? (
            <>
              <p>
                {collection &&
                  collection.pricings.length > 0 &&
                  collection.pricings[0].pricings.length}
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
