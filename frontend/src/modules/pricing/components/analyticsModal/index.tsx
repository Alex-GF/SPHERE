import { IconButton, Modal, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { CloseFullscreen } from "@mui/icons-material";
import { LineChart } from "@mui/x-charts";
import { AnalyticsDataEntry } from "../../../../assets/data/analytics";

interface AnalyticsModalProps {
    open: boolean;
    onClose: () => void;
    pricingData: AnalyticsDataEntry[];
}

export default function AnalyticsModal({ open, onClose, pricingData } : AnalyticsModalProps) {

    return (
        <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 4, maxWidth: "80%", minWidth: "50%" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" gutterBottom>
              Analytics
              </Typography>
              <IconButton title="Reduce view" onClick={onClose}>
                  <CloseFullscreen />
              </IconButton>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, maxHeight: "80vh", overflowY: "auto" }}>
            {/* Line Charts */}
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Number of Possible Subscriptions Over Time
              </Typography>
              <LineChart
                width={500}
                height={300}
                series={[{ data: pricingData?.map((entry) => entry.analytics.configurationSpaceSize).reverse() ?? [], area: false, showMark: true, label: 'Available Subscriptions' }]}
                xAxis={[{ scaleType: 'point', data: pricingData?.map((entry) => new Date(entry.extractionDate).getFullYear().toString()).reverse() ?? [] }]}
                />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Price of Subscriptions Over Time
              </Typography>
              <LineChart
                width={500}
                height={300}
                series={[
                        { data: pricingData?.map((entry) => entry.analytics.minSubscriptionPrice).reverse() ?? [], area: false, showMark: true, label: 'Min Price' },
                        { data: pricingData?.map((entry) => entry.analytics.maxSubscriptionPrice).reverse() ?? [], area: false, showMark: true, label: 'Max Price' }]}
                xAxis={[{ scaleType: 'point', data: pricingData?.map((entry) => new Date(entry.extractionDate).getFullYear().toString()).reverse() ?? [] }]}
                />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Number of Plans Over Time
              </Typography>
              <LineChart
                width={500}
                height={300}
                series={[{ data: pricingData?.map((entry) => entry.analytics.numberOfPlans).reverse() ?? [], area: false, showMark: true, label: 'Plans' }]}
                xAxis={[{ scaleType: 'point', data: pricingData?.map((entry) => new Date(entry.extractionDate).getFullYear().toString()).reverse() ?? [] }]}
                />
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Number of Features Over Time
              </Typography>
              <LineChart
                width={500}
                height={300}
                series={[{ data: pricingData?.map((entry) => entry.analytics.numberOfFeatures).reverse() ?? [], area: false, showMark: true, label: 'Features' }]}
                xAxis={[{ scaleType: 'point', data: pricingData?.map((entry) => new Date(entry.extractionDate).getFullYear().toString()).reverse() ?? [] }]}
                />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Number of Usage Limits Over Time
              </Typography>
              <LineChart
                width={500}
                height={300}
                series={[{ data: pricingData?.map((entry) => entry.analytics.numberOfUsageLimits).reverse() ?? [], area: false, showMark: true, label: 'Usage Limits' }]}
                xAxis={[{ scaleType: 'point', data: pricingData?.map((entry) => new Date(entry.extractionDate).getFullYear().toString()).reverse() ?? [] }]}
                />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Number of Add-Ons Over Time
              </Typography>
              <LineChart
                width={500}
                height={300}
                series={[{ data: pricingData?.map((entry) => entry.analytics.numberOfAddOns).reverse() ?? [], area: false, showMark: true, label: 'Add-Ons' }]}
                xAxis={[{ scaleType: 'point', data: pricingData?.map((entry) => new Date(entry.extractionDate).getFullYear().toString()).reverse() ?? [] }]}
                />
            </Box>
            
          </Box>
        </Paper>
      </Modal>
    );
}