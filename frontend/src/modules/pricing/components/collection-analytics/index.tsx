import type { CollectionAnalytics } from '../../types/collection';
import { formatStringDates } from '../../../profile/utils/dates-util';
import { LuExpand } from 'react-icons/lu';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface StatsProps {
  collectionData: CollectionAnalytics;
  toggleModal: () => void;
  startDate: string | null;
  endDate: string | null;
}

export default function CollectionAnalytics({
  collectionData,
  toggleModal,
  startDate,
  endDate,
}: StatsProps) {
  const configurationSeries = collectionData ? collectionData.evolutionOfConfigurationSpaceSize.values.map((v, index) => ({
    date: formatStringDates([collectionData.evolutionOfConfigurationSpaceSize.dates[index]])[0],
    value: typeof v === 'number' ? parseFloat(v.toFixed(2)) : v,
  })) : [];
  const addOnSeries = collectionData ? collectionData.evolutionOfAddOns.values.map((v, index) => ({
    date: formatStringDates([collectionData.evolutionOfAddOns.dates[index]])[0],
    value: typeof v === 'number' ? parseFloat(v.toFixed(2)) : v,
  })) : [];

  function dateIntervalFilter(_: any, index: number) {
    const entryDate = collectionData ? new Date(collectionData.evolutionOfConfigurationSpaceSize.dates[index]) : new Date();

    return entryDate >= new Date(startDate!) && entryDate <= new Date(endDate!);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="mb-2 text-xl font-semibold">
          Analytics
        </h3>
        <button
          type="button"
          title="Discover more"
          onClick={toggleModal}
          className="rounded-full p-2 hover:bg-slate-100"
        >
          <LuExpand />
        </button>
      </div>
      {collectionData && collectionData.evolutionOfConfigurationSpaceSize ? (
        <div className="h-[300px] w-full max-w-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={configurationSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" name="Average Configuration Space Size" stroke="#0f766e" dot={collectionData.evolutionOfConfigurationSpaceSize.values.length <= 1} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="flex h-[500px] w-[500px] items-center justify-center text-base">
          No configuration space data available for this collection.
        </p>
      )}
      <div>
        {collectionData && collectionData.evolutionOfAddOns ? (
          <div className="h-[300px] w-full max-w-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={addOnSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" name="Average Number of AddOns" stroke="#7c3aed" dot={collectionData.evolutionOfAddOns.values.length <= 1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="flex h-[500px] w-[500px] items-center justify-center text-base">
            No add-ons data available for this collection.
          </p>
        )}
      </div>
    </>
  );
}
