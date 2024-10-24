import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { alpha, styled } from "@mui/system";
import { MdBrightness4, MdBrightness7 } from "react-icons/md";
import { FaBars } from "react-icons/fa";
import { grey, primary } from "../../theme/palette";
import ShortLogo from "../../components/short-logo";
import { useMode } from "../../hooks/useTheme";

const StyledAppBar = styled(AppBar)(({mode}: {mode: 'light' | 'dark'}) => ({
  backgroundColor: mode === 'light' ? grey[100] : "black",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
}));

const StyledButton = styled(Button)(({mode}: {mode: 'light' | 'dark'}) => ({
  textTransform: "none",
  color: mode === 'light' ? primary[700] : primary[100],
  fontWeight: 900,
  "&:hover": {
    backgroundColor: alpha(primary[100], 0.4),
    color: mode === 'light' ? primary [800] : primary[500]
  },
  transition: "all 0.3s ease"
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {mode, setMode} = useMode();

  const menuItems = ["Home", "Products", "Services", "About", "Contact"];

  const handleMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleColorMode = () => {
    setMode(mode === "light"? "dark" : "light");
  };

  return (
    <StyledAppBar position="sticky" mode={mode}>
      <Container maxWidth={false} sx={{marginLeft: 0}}>
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
                {menuItems.map((item) => (
                  <MenuItem
                    key={item}
                    onClick={handleMenuClose}
                    sx={{ color: mode === 'light'? primary[800] : primary[100], fontWeight: 900 }}
                  >
                    {item}
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
                {menuItems.map((item) => (
                  <StyledButton
                    key={item}
                    aria-label={item}
                    tabIndex={0}
                    mode={mode}
                  >
                    {item}
                  </StyledButton>
                ))}
              </Stack>
              <Stack direction="row" spacing={2}>
              <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                {mode === 'dark' ? <MdBrightness4 fill={primary[100]}/> : <MdBrightness7 fill={primary[800]}/>}
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