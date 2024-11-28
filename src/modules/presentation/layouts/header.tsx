import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/system';
import { FaUser } from 'react-icons/fa';
import Logo from '../../core/components/logo';
import { grey, primary } from '../../core/theme/palette';
import { useAuth } from '../../auth/hooks/useAuth';
import MobileHeaderItems from './components/mobile-header-items';
import DesktopHeaderItems from './components/desktop-header-items';
import { headerRoutes } from './router/header-routes';

const StyledAppBar = styled(AppBar)(() => ({
  background: grey[100],
  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
});

const NavItems = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { authUser } = useAuth();

  const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

  const handleOpenUserMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="xl">
        <StyledToolbar>
          <Logo sx={{ fill: primary[800] }} />

          {isMobile ? (
            <MobileHeaderItems headerRoutes={headerRoutes} />
          ) : (
            <DesktopHeaderItems headerRoutes={headerRoutes} />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NavItems>
              {authUser.isAuthenticated ? (
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} aria-label="user settings">
                    <Avatar sx={{ bgcolor: primary[900] }}>
                      <FaUser />
                    </Avatar>
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  {/* <Button
                    variant="outlined"
                    sx={{
                      color: primary[500],
                      borderColor: primary[500],
                      '&:hover': {
                        borderColor: primary[600],
                        color: primary[600],
                      },
                      textTransform: 'none',
                    }}
                    aria-label="login"
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: primary[800],
                      color: primary[100],
                      '&:hover': {
                        bgcolor: 'transparent',
                        borderColor: primary[600],
                        color: primary[600],
                      },
                      textTransform: 'none',
                    }}
                    aria-label="register"
                  >
                    Register
                  </Button> */}
                </>
              )}
            </NavItems>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseUserMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {settings.map(setting => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </StyledToolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Header;
