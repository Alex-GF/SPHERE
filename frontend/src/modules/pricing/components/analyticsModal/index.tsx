import { AnalyticsDataEntry } from "../../../../assets/data/analytics";
import { LuShrink } from 'react-icons/lu';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AnalyticsModalProps {
    open: boolean;
    onClose: () => void;
    pricingData: AnalyticsDataEntry[];
}

export default function AnalyticsModal({ open, onClose, pricingData } : AnalyticsModalProps) {
    const chartData = pricingData?.slice().reverse().map((entry) => ({
      date: new Date(entry.createdAt).toLocaleDateString(),
      configurationSpaceSize: entry.analytics.configurationSpaceSize,
      minPrice: entry.analytics.minSubscriptionPrice,
      maxPrice: entry.analytics.maxSubscriptionPrice,
      plans: entry.analytics.numberOfPlans,
      features: entry.analytics.numberOfFeatures,
      usageLimits: entry.analytics.numberOfUsageLimits,
      addOns: entry.analytics.numberOfAddOns,
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

    const seriesCards = [
      {
        key: 'configurationSpaceSize',
        label: 'Different Subscriptions Available',
        color: '#08aeb3',
        dataKey: 'configurationSpaceSize' as const,
      },
      {
        key: 'plans',
        label: 'Number of Plans',
        color: '#7c3aed',
        dataKey: 'plans' as const,
      },
      {
        key: 'features',
        label: 'Number of Features',
        color: '#0891b2',
        dataKey: 'features' as const,
      },
      {
        key: 'usageLimits',
        label: 'Number of Usage Limits',
        color: '#ea580c',
        dataKey: 'usageLimits' as const,
      },
      {
        key: 'addOns',
        label: 'Number of Add-Ons',
        color: '#16a34a',
        dataKey: 'addOns' as const,
      },
    ];

    if (!open) {
      return null;
    }

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
                className="rounded-full p-2 transition hover:bg-slate-100"
              >
                  <LuShrink />
              </button>
          </div>
          <div className="grid max-h-[80vh] grid-cols-1 gap-3 overflow-y-auto xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 shadow-sm xl:col-span-2">
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
              <ResponsiveContainer width="100%" height={300}>
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
            {seriesCards.map(({ key, label, color, dataKey }) => (
              <div key={key} className="rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-center gap-2 text-[16px] text-slate-800">
                  <span className="inline-block h-5 w-5" style={{ backgroundColor: color }} aria-hidden />
                  <span>{label} Over Time</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
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
                    <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={chartData.length <= 1} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
}