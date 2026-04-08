import { AnalyticsDataEntry } from "../../../../assets/data/analytics";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LuExpand } from 'react-icons/lu';

interface StatsProps {
    pricingData: AnalyticsDataEntry[];
    toggleModal: () => void;
}

export default function Analytics({ pricingData, toggleModal } : StatsProps) {
    const chartData = pricingData?.slice().reverse().map((entry) => ({
      date: new Date(entry.extractionDate).toLocaleDateString(),
      configurationSpaceSize: entry.analytics.configurationSpaceSize,
      minPrice: entry.analytics.minSubscriptionPrice,
      maxPrice: entry.analytics.maxSubscriptionPrice,
    })) ?? [];

    const axisTickStyle = { fill: '#374151', fontSize: 12 };
    const compactNumber = new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    });

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
              <div className="h-[300px] w-full max-w-[500px]">
                <div className="mb-2 flex items-center justify-center gap-2 text-[16px] text-slate-800">
                  <span className="inline-block h-5 w-5 bg-[#08aeb3]" aria-hidden />
                  <span>Configuration Space Size</span>
                </div>
                <ResponsiveContainer width="100%" height="86%">
                  <LineChart data={chartData} margin={{ top: 0, right: 10, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
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
                    <Line type="monotone" dataKey="configurationSpaceSize" stroke="#08aeb3" strokeWidth={3} dot={chartData.length <= 1} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 h-[300px] w-full max-w-[500px]">
                <div className="mb-2 flex items-center justify-center gap-3 text-[16px] text-slate-800">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-block h-3.5 w-3.5 bg-[#2563eb]" aria-hidden />
                    <span>Min subscription price</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-block h-3.5 w-3.5 bg-[#dc2626]" aria-hidden />
                    <span>Max subscription price</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="86%">
                  <LineChart data={chartData} margin={{ top: 0, right: 10, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
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
                    <Line type="monotone" dataKey="minPrice" name="Min subscription price" stroke="#2563eb" strokeWidth={3} dot={chartData.length <= 1} />
                    <Line type="monotone" dataKey="maxPrice" name="Max subscription price" stroke="#dc2626" strokeWidth={3} dot={chartData.length <= 1} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
    );
}