import { Helmet } from 'react-helmet';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import RouterLink from '../../components/router-link';
import Logo404 from '../../components/404-logo';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title> 404 Page Not Found </title>
      </Helmet>

      <Container>
        <Box
          sx={{
            py: 12,
            maxWidth: 480,
            mx: 'auto',
            display: 'flex',
            minHeight: '100vh',
            textAlign: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" sx={{ mb: 3 }}>
            Sorry, page not found!
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be
            sure to check your spelling.
          </Typography>

          <Box
            sx={{
              mx: 'auto',
              height: 260,
              mt: { xs: 5, sm: 10 },
              mb: { xs: 15, sm: 20 },
            }}
          >
            <Logo404 />
          </Box>

          <Button
            href="/"
            size="large"
            variant="contained"
            component={RouterLink}
            sx={{ cursor: 'pointer' }}
          >
            Return to Home
          </Button>
        </Box>
      </Container>
    </>
  );
}
