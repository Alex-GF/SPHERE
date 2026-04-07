import { AnalyticsDataEntry } from "../../../../assets/data/analytics";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LuExpand } from 'react-icons/lu';

interface StatsProps {
    pricingData: AnalyticsDataEntry[];
    toggleModal: () => void;
}

export default function Analytics({ pricingData, toggleModal } : StatsProps) {
    const chartData = pricingData?.slice().reverse().map((entry) => ({
      year: new Date(entry.extractionDate).getFullYear().toString(),
      configurationSpaceSize: entry.analytics.configurationSpaceSize,
      minPrice: entry.analytics.minSubscriptionPrice,
      maxPrice: entry.analytics.maxSubscriptionPrice,
    })) ?? [];

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
              <div className="h-[300px] w-full max-w-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="configurationSpaceSize" name="Different Subscriptions Available" stroke="#0f766e" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="h-[300px] w-full max-w-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="minPrice" name="Min Price Subscription" stroke="#2563eb" dot />
                      <Line type="monotone" dataKey="maxPrice" name="Max Price Subscription" stroke="#dc2626" dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </div>
            </>
    );
}