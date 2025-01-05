import { Box, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Logo from '../../../../core/components/logo';
import { grey } from '../../../../core/theme/palette';
import { headerRoutes } from '../../router/header-routes';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#033E8A',
        py: 3,
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Top row with logo and navigation */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* Logo */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Logo sx={{ fill: grey[100] }} />
            </Stack>

            {/* Navigation Links */}
            <Stack direction="row" spacing={4} component="nav">
              {headerRoutes.map(
                (link, index) =>
                  !link.children && (
                    <Link
                      key={index}
                      to={link.to ? link.to : '#'}
                      style={{
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      {link.name}
                    </Link>
                  )
              )}
            </Stack>
          </Stack>

          {/* Bottom row with copyright and social icons */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              pt: 3,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              © {new Date().getFullYear()} SPHERE. All rights reserved.
            </Typography>

            {/* Social Media Icons */}
            {/* <Stack direction="row" spacing={2}>
              {[
                { icon: <FaFacebook />, label: 'Facebook', to: 'https://www.facebook.com' },
                { icon: <FaTwitter />, label: 'Twitter', to: 'https://www.facebook.com' },
                { icon: <FaInstagram />, label: 'Instagram', to: 'https://www.facebook.com' },
                { icon: <FaLinkedin />, label: 'LinkedIn', to: 'https://www.facebook.com' },
                { icon: <FaYoutube />, label: 'YouTube', to: 'https://www.youtube.com' },
              ].map(social => (
                <IconButton
                  key={social.label}
                  aria-label={social.label}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  href={social.to}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack> */}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
