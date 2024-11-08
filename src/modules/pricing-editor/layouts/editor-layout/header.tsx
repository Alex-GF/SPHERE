import { useState } from 'react';
import {
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MdBrightness4, MdBrightness7 } from 'react-icons/md';
import { FaBars } from 'react-icons/fa';
import { primary } from '../../../core/theme/palette';
import ShortLogo from '../../../core/components/short-logo';
import { StyledAppBar } from './components/styled-appbar';
import { StyledButton } from './components/styled-button';
import { useMode } from '../../../core/hooks/useTheme';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, setMode } = useMode();

  const menuItems = [
    // {
    //   name: "File",
    //   disabled: false,
    //   children: [
    //     { name: "New", disabled: false, onClick: () => console.log("New") },
    //   ],
    // },
    // {
    //   name: "About",
    //   disabled: false,
    //   children: [
    //     { name: "Docs", disabled: false, onClick: () => console.log("Docs") },
    //   ],
    // },
    {
      name: 'Documentation',
      disabled: false,
      onClick: () => window.open('https://pricing4saas-docs.vercel.app'),
    },
  ];

  const handleMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleColorMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <StyledAppBar position="sticky" mode={mode}>
      <Container maxWidth={false} sx={{ marginLeft: 0 }}>
        <Toolbar disableGutters>
          <ShortLogo sx={{ fill: mode === 'light' ? primary[800] : primary[100] }} />

          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
                sx={{ color: mode === 'light' ? primary[800] : primary[100] }}
              >
                <FaBars />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{ mt: 1 }}
              >
                {menuItems.map((item, index) => (
                  <MenuItem
                    key={index}
                    onClick={handleMenuClose}
                    sx={{
                      color: mode === 'light' ? primary[800] : primary[100],
                      fontWeight: 900,
                    }}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <>
              <Stack
                direction="row"
                spacing={2}
                sx={{ flexGrow: 1, ml: 2 }}
                role="navigation"
                aria-label="Main navigation"
              >
                {menuItems.map((item, index) => (
                  <StyledButton
                    key={index}
                    aria-label={item.name}
                    tabIndex={0}
                    mode={mode}
                    onClick={item.onClick}
                  >
                    {item.name}
                  </StyledButton>
                ))}
              </Stack>
              <Stack direction="row" spacing={2}>
                <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                  {mode === 'dark' ? (
                    <MdBrightness4 fill={primary[100]} />
                  ) : (
                    <MdBrightness7 fill={primary[800]} />
                  )}
                </IconButton>
              </Stack>
            </>
          )}
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Header;
