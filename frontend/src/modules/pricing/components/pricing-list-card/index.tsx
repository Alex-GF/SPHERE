import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useRouter } from '../../../core/hooks/useRouter';
import { StyledChip } from '../../pages/card';
import { PricingEntry } from '../../pages/list';

// const CARD_HEIGHT = 400;
const CARD_HEIGHT = 250;

export default function PricingListCard({
  name,
  dataEntry,
}: {
  name: string;
  dataEntry: PricingEntry;
}) {
  const router = useRouter();

  return (
    <Card
      onClick={() => {
        router.push(`/pricings/card?name=${name}`);
      }}
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        p: 2,
        maxWidth: 400,
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
        <Stack justifyContent="center" height={65}>
          <Typography variant="h6" textAlign="center" sx={{ fontWeight: 'bold', mt: 1 }}>
            sphere/{name}
          </Typography>
        </Stack>
        <Box
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
            displayed is from {new Date(dataEntry.extractionDate).toLocaleDateString()}. The prices are
            displayed with EUR currency. In future versions, more data will be provided in this
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
        </Box>
        <Stack
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
          {/* {pricing.tags.map(tag => tag)} */}
          <StyledChip label="Productivity" variant="outlined" />
          <StyledChip label="Freemium" variant="outlined" />
          <StyledChip label="Microsoft" variant="outlined" />
          <StyledChip label="+1M users" variant="outlined" />
          <StyledChip label="USD" variant="outlined" />
          <StyledChip label="USA" variant="outlined" />
        </Stack>
      </CardContent>
    </Card>
  );
}
