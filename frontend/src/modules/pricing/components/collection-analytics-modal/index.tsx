import { CollectionAnalytics } from '../../types/collection';
import { formatStringDates } from '../../../profile/utils/dates-util';
import { LuShrink } from 'react-icons/lu';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
  const chartColor = '#08aeb3';
  const axisTickStyle = { fill: '#374151', fontSize: 12 };
  const compactNumber = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  if (!open) {
    return null;
  }

  function withinDateRange(date: string) {
    if (!startDate || !endDate) return true;
    const entryDate = new Date(date);
    return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
  }

  function formatYAxisTick(value: number) {
    if (!Number.isFinite(value)) return '';
    if (Math.abs(value) >= 1000) return compactNumber.format(value);
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(1);
  }

  const seriesEntries = Object.entries(collectionData).map(([key, value]) => {
    const points = value.dates
      .map((date: string, index: number) => ({
        rawDate: date,
        date: formatStringDates([date])[0],
        value: typeof value.values[index] === 'number'
          ? parseFloat(Number(value.values[index]).toFixed(2))
          : value.values[index],
      }))
      .filter((entry: { rawDate: string; date: string; value: number }) => withinDateRange(entry.rawDate));

    return {
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      points,
      singlePoint: points.length <= 1,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] min-w-[50%] max-w-[80%] overflow-auto rounded-xl bg-white p-10"
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
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="inline-block h-3.5 w-3.5 bg-[#08aeb3]" aria-hidden />
                <p>{label} Over Time</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points} margin={{ top: 0, right: 10, left: -8, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={axisTickStyle}
                      axisLine={{ stroke: '#6b7280', strokeWidth: 1.2 }}
                      tickLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis
                      tick={axisTickStyle}
                      axisLine={{ stroke: '#6b7280', strokeWidth: 1.2 }}
                      tickLine={{ stroke: '#6b7280' }}
                      tickCount={6}
                      domain={['auto', 'auto']}
                      tickFormatter={formatYAxisTick}
                      width={56}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={`Average ${label}`}
                      stroke={chartColor}
                      strokeWidth={3}
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
