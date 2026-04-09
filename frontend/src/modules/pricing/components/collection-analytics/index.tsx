import type { CollectionAnalytics } from '../../types/collection';
import { formatStringDates } from '../../../profile/utils/dates-util';
import { LuExpand } from 'react-icons/lu';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
  const chartColor = '#08aeb3';
  const compactNumber = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  function withinDateRange(date: string) {
    if (!startDate || !endDate) return true;
    const entryDate = new Date(date);
    return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
  }

  function toChartSeries(dates: string[], values: number[]) {
    return dates
      .map((date, index) => ({
        rawDate: date,
        date: formatStringDates([date])[0],
        value: typeof values[index] === 'number' ? parseFloat(values[index].toFixed(2)) : values[index],
      }))
      .filter((entry) => withinDateRange(entry.rawDate));
  }

  const configurationSeries = collectionData?.evolutionOfConfigurationSpaceSize
    ? toChartSeries(
        collectionData.evolutionOfConfigurationSpaceSize.dates,
        collectionData.evolutionOfConfigurationSpaceSize.values
      )
    : [];

  const addOnsSeries = collectionData?.evolutionOfAddOns
    ? toChartSeries(
        collectionData.evolutionOfAddOns.dates,
        collectionData.evolutionOfAddOns.values
      )
    : [];

  const axisTickStyle = { fill: '#374151', fontSize: 12 };

  const formatYAxisTick = (value: number) => {
    if (!Number.isFinite(value)) return '';
    if (Math.abs(value) >= 1000) return compactNumber.format(value);
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(1);
  };

  return (
    <>
      <div className="mb-2 flex items-center justify-between p-2">
        <h3 className="text-xl font-semibold">
          Analytics
        </h3>
        <button
          type="button"
          title="Discover more"
          onClick={toggleModal}
          className="rounded-full p-2 transition hover:bg-slate-100"
        >
          <LuExpand />
        </button>
      </div>
      {collectionData && collectionData.evolutionOfConfigurationSpaceSize ? (
        <div className="h-[300px] w-full max-w-[500px]">
          <div className="mb-2 flex items-center justify-center gap-2 text-[16px] text-slate-800">
            <span className="inline-block h-5 w-5 bg-[#08aeb3]" aria-hidden />
            <span>Average Configuration Space Size</span>
          </div>
          <ResponsiveContainer width="100%" height="86%">
            <LineChart data={configurationSeries} margin={{ top: 0, right: 10, left: -8, bottom: 0 }}>
              <XAxis dataKey="date" tick={axisTickStyle} axisLine={{ stroke: '#6b7280', strokeWidth: 1.4 }} tickLine={{ stroke: '#6b7280' }} />
              <YAxis
                tick={axisTickStyle}
                axisLine={{ stroke: '#6b7280', strokeWidth: 1.4 }}
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
                stroke={chartColor}
                strokeWidth={3}
                dot={configurationSeries.length <= 1}
              />
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
            <div className="mb-2 flex items-center justify-center gap-2 text-[16px] text-slate-800">
              <span className="inline-block h-5 w-5 bg-[#08aeb3]" aria-hidden />
              <span>Average Number of AddOns</span>
            </div>
            <ResponsiveContainer width="100%" height="86%">
              <LineChart data={addOnsSeries} margin={{ top: 0, right: 10, left: -8, bottom: 0 }}>
                <XAxis dataKey="date" tick={axisTickStyle} axisLine={{ stroke: '#6b7280', strokeWidth: 1.4 }} tickLine={{ stroke: '#6b7280' }} />
                <YAxis
                  tick={axisTickStyle}
                  axisLine={{ stroke: '#6b7280', strokeWidth: 1.4 }}
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
                  stroke={chartColor}
                  strokeWidth={3}
                  dot={addOnsSeries.length <= 1}
                />
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