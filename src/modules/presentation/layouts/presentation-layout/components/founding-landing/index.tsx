import { MonetizationOn } from '@mui/icons-material';
import { Button, ImageList, Link, Typography } from '@mui/material';
import { Box, Container, styled } from '@mui/system';
import { flex } from '../../../../../core/theme/css';
import { StyledButtonLanding } from '../styled-button-landing';

export default function FoundingLanding() {
  return (
    <Box sx={{ width: '100dvw', my: { xs: 8, sm: 12 } }}>
      <Container maxWidth="xl" sx={{ ...flex({ direction: 'column', justify: 'center' })}}>
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
          Founded by Public Entities
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
          SPHERE is a collaborative effort backed by public entities, dedicated to advancing research and innovation in SaaS pricing. Our mission is to democratize access to cutting-edge technology, empowering researchers worldwide.
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
          Discover the public entities, projects, and grants that have made SPHERE possible.
        </Typography>
        <StyledButtonLanding variant="contained" color="primary" size="large" sx={{ mt: 5 }} startIcon={<MonetizationOn />}>
          Find Out Our Partners
        </StyledButtonLanding>
        <ImageList cols={3} sx={{ mt: 5, align: 'center', justifyContent: 'center' }}>
            <Link href="https://score.us.es">
              <img
                  alt="SCORE Lab"
                  src="assets/landing/score.png"
                  width={400}
                  height={125}
                  style={{
                      borderRadius: '16px',
                      objectFit: 'contain',
                  }}
              />
            </Link>
            <Link href="https://www.aei.gob.es">
              <img
                  alt="Spanish and European Government"
                  src="assets/landing/government.png"
                  width={400}
                  height={125}
                  style={{
                      borderRadius: '16px',
                      objectFit: 'contain',
                  }}
              />
            </Link>
            <Link href="https://www.us.es">
              <img
                  alt="US"
                  src="assets/landing/university.png"
                  width={400}
                  height={125}
                  style={{
                      borderRadius: '16px',
                      objectFit: 'contain',
                  }}
              />
            </Link>
        </ImageList>
      </Container>
    </Box>
  );
}
