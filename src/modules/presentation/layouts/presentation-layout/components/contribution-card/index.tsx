import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import { Contribution } from '../../../../pages/contributions/data/contributions-data';

const CARD_HEIGHT = 400;

export default function ContributionCard({ contribution, onClick }: { contribution: Contribution, onClick: () => void}) {
  return (
    <Card
      onClick={onClick}
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
        <Typography variant="h6" textAlign="center" sx={{ fontWeight: 'bold', mt: 1 }}>
          {contribution.title}
        </Typography>
        <Box
          sx={{
            position: 'relative',
            maxHeight: 200,
            overflow: 'hidden',
            mt: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="justify" sx={{ mt: 1, height: 200 }}>
            {contribution.description}
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
            maxHeight: 34,
            overflow: 'hidden',
          }}
        >
          {contribution.tags.map(tag => tag)}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            Supervisor:
          </Box>{' '}
          {contribution.supervisor.length > 40
            ? `${contribution.supervisor.slice(0, 37)}...`
            : contribution.supervisor}
        </Typography>
      </CardContent>
    </Card>
  );
}
