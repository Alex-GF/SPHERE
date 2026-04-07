import { AnalyticsDataEntry } from "../../../../assets/data/analytics";
import { LuShrink } from 'react-icons/lu';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AnalyticsModalProps {
    open: boolean;
    onClose: () => void;
    pricingData: AnalyticsDataEntry[];
}

export default function AnalyticsModal({ open, onClose, pricingData } : AnalyticsModalProps) {
    const chartData = pricingData?.slice().reverse().map((entry) => ({
      year: new Date(entry.extractionDate).getFullYear().toString(),
      available: entry.analytics.configurationSpaceSize,
      minPrice: entry.analytics.minSubscriptionPrice,
      maxPrice: entry.analytics.maxSubscriptionPrice,
      plans: entry.analytics.numberOfPlans,
      features: entry.analytics.numberOfFeatures,
      usageLimits: entry.analytics.numberOfUsageLimits,
      addOns: entry.analytics.numberOfAddOns,
    })) ?? [];

    if (!open) {
      return null;
    }

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
            {/* Line Charts */}
            <div>
              <p className="mb-2 text-sm text-slate-500">
              Number of Possible Subscriptions Over Time
              </p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="available" name="Available Subscriptions" stroke="#0f766e" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-500">
              Price of Subscriptions Over Time
              </p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="minPrice" name="Min Price" stroke="#2563eb" dot />
                    <Line type="monotone" dataKey="maxPrice" name="Max Price" stroke="#dc2626" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-500">
              Number of Plans Over Time
              </p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="plans" name="Plans" stroke="#7c3aed" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <p className="mb-2 text-sm text-slate-500">
              Number of Features Over Time
              </p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="features" name="Features" stroke="#0891b2" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-500">
              Number of Usage Limits Over Time
              </p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="usageLimits" name="Usage Limits" stroke="#ea580c" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-500">
              Number of Add-Ons Over Time
              </p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="addOns" name="Add-Ons" stroke="#16a34a" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    );
}