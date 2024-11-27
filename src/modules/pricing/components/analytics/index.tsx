import { IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { AnalyticsDataEntry } from "../../../../assets/data/analytics";
import { OpenInFull } from "@mui/icons-material";
import { LineChart } from "@mui/x-charts";

interface StatsProps {
    pricingData: AnalyticsDataEntry[];
    toggleModal: () => void;
}

export default function Analytics({ pricingData, toggleModal } : StatsProps) {

    return (
        <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" gutterBottom>
                Analytics
                </Typography>
                <IconButton title="Discover more" onClick={toggleModal}>
                  <OpenInFull />
                </IconButton>
              </Box>
              <LineChart
                width={500}
                height={300}
                series={[{ data: pricingData?.map((entry) => entry.analytics.configurationSpaceSize).reverse() ?? [], label: 'Different Subscriptions Available', area: false, showMark: true }]}
                xAxis={[{ scaleType: 'point', data: pricingData?.map((entry) => new Date(entry.date).getFullYear().toString()).reverse() ?? [] }]}
                />
            </>
    );
}