import { LibraryBooks, People } from '@mui/icons-material';
import { Button, ImageList, Typography } from '@mui/material';
import { Box, Container } from '@mui/system';
import { flex } from '../../../core/theme/css';
import { useRouter } from '../../../core/hooks/useRouter';
import { StyledButtonLanding } from '../styled-button-landing';

export default function ResearchLanding() {
  const router = useRouter();

  return (
    <Box sx={{ width: '100dvw', my: { xs: 8, sm: 12 } }}>
      <Container maxWidth="xl" sx={{ ...flex({ direction: 'column', justify: 'center' }) }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          sx={{
            mb: 2,
            fontWeight: 700,
            fontSize: { xs: 32, sm: 40 },
          }}
        >
          Powered by Research and Innovation
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{
            maxWidth: 'lg',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Our platform is the result of cutting-edge research and the dedication of a world-class
          team. The scientific publications behind our technology and the brilliant minds of our
          researchers have made it possible to create powerful and flexible solutions for DevOps
          teams and SaaS pricing management.
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{
            maxWidth: 'md',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          We invite you to explore the foundation of our success and meet the people who make it all
          possible.
        </Typography>
        <ImageList gap={25}>
          <img
            alt=""
            src="assets/landing/research/presenter1.heic"
            width={400}
            height={250}
            style={{
              borderRadius: '16px',
              objectFit: 'cover',
            }}
          />
          <img
            alt=""
            src="assets/landing/research/presenter3.heic"
            width={400}
            height={250}
            style={{
              borderRadius: '16px',
              objectFit: 'cover',
            }}
          />
          <img
            alt=""
            src="assets/landing/research/group.heic"
            width={400}
            height={250}
            style={{
              borderRadius: '16px',
              objectFit: 'cover',
            }}
          />
          <img
            alt=""
            src="assets/landing/research/award.jpg"
            width={400}
            height={250}
            style={{
              borderRadius: '16px',
              objectFit: 'cover',
            }}
          />
        </ImageList>
        <Box mt={5} sx={{ ...flex({ justify: 'center', align: 'center' }) }} gap={3.5}>
          <StyledButtonLanding
            variant="contained"
            startIcon={<LibraryBooks />}
            size="large"
            sx={{
              width: 400,
            }}
            onClick={() => router.push('/research')}
          >
            Discover All Our Publications
          </StyledButtonLanding>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<People />}
            size="large"
            sx={{ width: 400, textAlign: 'center' }}
            onClick={() => router.push('/team')}
          >
            Meet Our Team And Collaborators
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
