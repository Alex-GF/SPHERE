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
  useMediaQuery,
  Button,
} from '@mui/material';
import { styled } from '@mui/system';
import Logo from '../../core/components/logo';
import { grey, primary } from '../../core/theme/palette';
import { useAuth } from '../../auth/hooks/useAuth';
import MobileHeaderItems from './components/mobile-header-items';
import DesktopHeaderItems from './components/desktop-header-items';
import { headerRoutes } from './router/header-routes';
import { useRouter } from '../../core/hooks/useRouter';

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

const Header = ({ setUploadModalOpen }: { setUploadModalOpen: (state: boolean) => void }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { authUser, logout } = useAuth();
  const router = useRouter();

  const settings = [
    {
      name: 'My Pricings',
      onClick: () => {
        router.push('/me/pricings');
        handleCloseUserMenu();
      },
    },
    {
      name: 'Upload pricing',
      onClick: () => {
        setUploadModalOpen(true);
      },
    },
    {
      name: 'Logout',
      onClick: () => {
        logout();
        handleCloseUserMenu();
        router.push('/');
      },
    },
  ];

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
                    <Avatar src={authUser.user?.avatar} />
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Button
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
                    onClick={() => router.push('/login')}
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
                    onClick={() => router.push('/register')}
                  >
                    Register
                  </Button>
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
              <MenuItem
                sx={{
                  cursor: 'default',
                  width: 200,
                  textAlign: 'center',
                  marginBottom: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography fontSize={16} fontWeight="bold" marginBottom={2}>
                  {authUser.user?.firstName}
                </Typography>
                <Box
                  sx={{
                    cursor: 'default',
                    width: '90%',
                    height: '1px',
                    backgroundColor: grey[500],
                  }}
                />
              </MenuItem>
              {settings.map(setting => (
                <MenuItem key={setting.name} onClick={setting.onClick}>
                  <Typography textAlign="center">{setting.name}</Typography>
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
