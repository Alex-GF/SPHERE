import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Pricing } from "pricing4ts";
import { AnalyticsDataEntry } from "../../../../assets/data/analytics";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { CURRENCIES } from "../../pages/card";

interface StatsProps {
    pricingDetails: {
        size: string;
        lastModified: string;
    };
    currentPricing: AnalyticsDataEntry;
    pricing: Pricing;
}

export const getCurrency = (currency: string) => {
    const parsedCurrency = currency as keyof typeof CURRENCIES;
    return currency in CURRENCIES ? CURRENCIES[parsedCurrency] : CURRENCIES['USD'];
};

export default function Stats({ pricingDetails, currentPricing, pricing } : StatsProps) {
    return (
        <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>
                      Stats
                  </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                        {currentPricing && formatDistanceToNow(parseISO(currentPricing.date))} ago
                      <Typography variant="body2" color="text.secondary">
                          last updated
                      </Typography>
                  </Box>
                  <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                      <Typography variant="body1">
                          {currentPricing?.analytics.configurationSpaceSize}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                          possible subscriptions
                      </Typography>
                  </Box>
                  <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                      <Typography variant="body1">
                          Min {currentPricing?.analytics.minSubscriptionPrice}{pricing?getCurrency(pricing.currency):''} - Max {currentPricing?.analytics.maxSubscriptionPrice}{pricing?getCurrency(pricing.currency):''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                          monthly cost
                      </Typography>
                  </Box>
              </Box>
            </>
    );
}