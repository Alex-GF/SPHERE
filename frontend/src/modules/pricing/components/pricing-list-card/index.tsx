import { Box, Card, CardContent, Stack, styled, Typography } from '@mui/material';
import { useRouter } from '../../../core/hooks/useRouter';
import { PricingEntry } from '../../pages/list';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { getCurrency } from '../stats';
import { IoMdPricetags } from 'react-icons/io';
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { grey } from '../../../core/theme/palette';

// const CARD_HEIGHT = 400;
const CARD_HEIGHT = 150;

const StatsDivider = styled(Box)(() => ({
  height: 5,
  width: 5,
  borderRadius: '50%',
  backgroundColor: '#000000',
  margin: '0 10px',
}));

export default function PricingListCard({
  name,
  owner,
  dataEntry,
}: {
  name: string;
  owner: string;
  dataEntry: PricingEntry;
}) {
  const router = useRouter();

  return (
    <Card
      onClick={() => {
        router.push(`/pricings/${owner}/${name}`);
      }}
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        padding: "0 5px",
        width: "100%",
        maxWidth: 600,
        height: CARD_HEIGHT,
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 0 10px 2px', // Box shadow en hover
          boxShadowColor: 'primary.700',
          cursor: 'pointer',
        },
      }}
    >
      <CardContent>
        <Stack justifyContent="center" height={45} pl="10px">
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
            {dataEntry.owner}/{name}
          </Typography>
        </Stack>
        {/* <Box
          sx={{
            position: 'relative',
            maxHeight: 200,
            overflow: 'hidden',
            mt: 1,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="justify"
            sx={{ mt: 1, height: 200 }}
          >
            This is the pricing information for {name}. The pricing version that is currently
            displayed is from {new Date(dataEntry.extractionDate).toLocaleDateString()}. The prices
            are displayed with EUR currency. In future versions, more data will be provided in this
            card.
          </Typography>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 40,
              backgroundImage:
                'linear-gradient(to bottom, rgba(0, 0, 0, 0.01) 0%, rgba(255, 255, 255, 1) 100%)',
            }}
          />
        </Box> */}
        <Box display="flex" justifyContent="space-evenly" alignItems="center" mt={2}>
          <Box>
            <Typography component="span">Updated </Typography>
            {dataEntry && formatDistanceToNow(parseISO(dataEntry.extractionDate))} ago
          </Box>
          <StatsDivider />
          <Box display="flex" justifyContent="center" alignItems="center">
            <FaFileInvoiceDollar fill={grey[700]} style={{ height: 18, width: 18, marginRight: 10 }}/>
            <Typography variant="body1">{dataEntry.analytics.configurationSpaceSize} subscriptions</Typography>
          </Box>
          <StatsDivider />
          <Box display="flex" justifyContent="between" alignItems="center">
            <IoMdPricetags fill={grey[700]} style={{ height: 20, width: 20, marginRight: 10 }} />

            <Typography variant="body1">
              {dataEntry.analytics.minSubscriptionPrice}
              {getCurrency(dataEntry.currency)} - {dataEntry?.analytics.maxSubscriptionPrice}
              {getCurrency(dataEntry.currency)}
            </Typography>
          </Box>
        </Box>
        {/* <Stack
          direction="row"
          justifyContent="space-evenly"
          flexWrap="wrap"
          gap={2}
          sx={{
            mt: 2,
            maxHeight: 40,
            overflow: 'hidden',
          }}
        >
          {pricing.tags.map(tag => tag)}
          <StyledChip label="Productivity" variant="outlined" />
          <StyledChip label="Freemium" variant="outlined" />
          <StyledChip label="Microsoft" variant="outlined" />
          <StyledChip label="+1M users" variant="outlined" />
          <StyledChip label="USD" variant="outlined" />
          <StyledChip label="USA" variant="outlined" />
        </Stack> */}
      </CardContent>
    </Card>
  );
}
