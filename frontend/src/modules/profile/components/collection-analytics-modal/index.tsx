import { IconButton, Modal, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { CloseFullscreen } from "@mui/icons-material";
import { LineChart } from "@mui/x-charts";
import { CollectionAnalytics } from "../../types/collection";
import { formatStringDates } from "../../utils/dates-util";

interface CollectionAnalyticsModalProps {
    open: boolean;
    onClose: () => void;
    collectionData: CollectionAnalytics;
}

export default function CollectionAnalyticsModal({ open, onClose, collectionData } : CollectionAnalyticsModalProps) {

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
          <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Average Number of Plans Over Time
              </Typography>
              <LineChart
                    width={500}
                    height={300}
                    series={[
                      {
                        data: collectionData.evolutionOfPlans.values.reverse() ?? [],
                        label: 'Averge Number of Plans',
                        area: false,
                        showMark: true,
                      },
                    ]}
                    xAxis={[
                      {
                        scaleType: 'point',
                        data: formatStringDates(collectionData.evolutionOfPlans.dates)
                      },
                    ]}
                  />
            </Box>
          
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Average Number of AddOns Over Time
              </Typography>
              <LineChart
                      width={500}
                      height={300}
                      series={[
                        {
                          data: collectionData.evolutionOfAddOns.values.reverse() ?? [],
                          area: false,
                          showMark: true,
                          label: 'Average Number of AddOns',
                        },
                      ]}
                      xAxis={[
                        {
                          scaleType: 'point',
                          data: formatStringDates(collectionData.evolutionOfAddOns.dates)
                        },
                      ]}
                    />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Number of Features Over Time
              </Typography>
              <LineChart
                      width={500}
                      height={300}
                      series={[
                        {
                          data: collectionData.evolutionOfFeatures.values.reverse() ?? [],
                          area: false,
                          showMark: true,
                          label: 'Average Number of Features',
                        },
                      ]}
                      xAxis={[
                        {
                          scaleType: 'point',
                          data: formatStringDates(collectionData.evolutionOfFeatures.dates)
                        },
                      ]}
                    />
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Configuration Space Size Over Time
              </Typography>
              <LineChart
                      width={500}
                      height={300}
                      series={[
                        {
                          data: collectionData.evolutionOfConfigurationSpaceSize.values.reverse() ?? [],
                          area: false,
                          showMark: true,
                          label: 'Average Configuration Space',
                        },
                      ]}
                      xAxis={[
                        {
                          scaleType: 'point',
                          data: formatStringDates(collectionData.evolutionOfConfigurationSpaceSize.dates)
                        },
                      ]}
                    />
            </Box>
          {/*
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Number of Usage Limits Over Time
              </Typography>
              <LineChart
                width={500}
                height={300}
                series={[{ data: collectionData?.map((entry) => entry.analytics.numberOfUsageLimits).reverse() ?? [], area: false, showMark: true, label: 'Usage Limits' }]}
                xAxis={[{ scaleType: 'point', data: collectionData?.map((entry) => new Date(entry.extractionDate).getFullYear().toString()).reverse() ?? [] }]}
                />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
              Number of Add-Ons Over Time
              </Typography>
              <LineChart
                width={500}
                height={300}
                series={[{ data: collectionData?.map((entry) => entry.analytics.numberOfAddOns).reverse() ?? [], area: false, showMark: true, label: 'Add-Ons' }]}
                xAxis={[{ scaleType: 'point', data: collectionData?.map((entry) => new Date(entry.extractionDate).getFullYear().toString()).reverse() ?? [] }]}
                />
            </Box> */}
            
          </Box>
        </Paper>
      </Modal>
    );
}