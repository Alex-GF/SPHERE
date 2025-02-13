import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { CURRENCIES } from "../../../pricing/pages/card";
import { Collection } from "../../types/collection";

interface StatsProps {
    readonly collection: Collection;
}

export const getCurrency = (currency: string) => {
    const parsedCurrency = currency as keyof typeof CURRENCIES;
    return currency in CURRENCIES ? CURRENCIES[parsedCurrency] : CURRENCIES['USD'];
};

export default function CollectionStats({ collection } : StatsProps) {
    return (
        <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>
                      Stats
                  </Typography>
              </Box>
              <Box display="flex" justifyContent="space-evenly" alignItems="center" mt={2}>
                  <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                        {collection && formatDistanceToNow(parseISO(collection.lastUpdate))} ago
                      <Typography variant="body2" color="text.secondary">
                          last updated
                      </Typography>
                  </Box>
                  <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                      <Typography variant="body1">
                          {collection && collection.pricings.length > 0 && collection.pricings[0].pricings.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                          pricings
                      </Typography>
                  </Box>
                  {/* <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                      <Typography variant="body1">
                          Min {currentCollection?.analytics.minSubscriptionPrice}{collection ? getCurrency(collection.currency):''} - Max {currentCollection?.analytics.maxSubscriptionPrice}{collection?getCurrency(collection.currency):''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                          monthly cost
                      </Typography>
                  </Box> */}
              </Box>
            </>
    );
}