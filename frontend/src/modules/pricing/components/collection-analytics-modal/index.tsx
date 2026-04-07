import { CollectionAnalytics } from '../../types/collection';
import { formatStringDates } from '../../../profile/utils/dates-util';
import { LuShrink } from 'react-icons/lu';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CollectionAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  collectionData: CollectionAnalytics;
  startDate: string | null;
  endDate: string | null;
}

export default function CollectionAnalyticsModal({
  open,
  onClose,
  collectionData,
  startDate,
  endDate
}: CollectionAnalyticsModalProps) {

  if (!open) {
    return null;
  }

  function dateIntervalFilter(_: any, index: number) {
    const entryDate = new Date(collectionData.evolutionOfConfigurationSpaceSize.dates[index]);

    return entryDate >= new Date(startDate!) && entryDate <= new Date(endDate!);
  }

  const seriesEntries = Object.entries(collectionData).map(([key, value]) => {
    const dates = startDate && endDate ? value.dates.filter(dateIntervalFilter) : value.dates;
    const values = startDate && endDate ? value.values.filter(dateIntervalFilter) : value.values;

    return {
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      points: dates.map((date: string, index: number) => ({
        date: formatStringDates([date])[0],
        value: typeof values[index] === 'number' ? parseFloat(Number(values[index]).toFixed(2)) : values[index],
      })),
      singlePoint: value.values.length <= 1,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] min-w-[50%] max-w-[80%] overflow-auto rounded-xl bg-white p-4"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <h3 className="mb-2 text-xl font-semibold">
            Analytics
          </h3>
          <button
            type="button"
            title="Reduce view"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <LuShrink />
          </button>
        </div>
        <div className="grid max-h-[80vh] grid-cols-1 gap-3 overflow-y-auto xl:grid-cols-2">
          {collectionData && seriesEntries.map(({ key, label, points, singlePoint }) => (
            <div key={key}>
              <p className="mb-2 text-sm text-slate-500">
                {label} Over Time
              </p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={`Average ${label}`}
                      stroke="#0f766e"
                      dot={singlePoint}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
