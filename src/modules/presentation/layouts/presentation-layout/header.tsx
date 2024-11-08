import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { alpha, styled } from "@mui/system";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import Logo from "../../modules/core/components/logo";
import { grey, primary } from "../../theme/palette";
import { useAuth } from "../../hooks/useAuth";

const StyledAppBar = styled(AppBar)(() => ({
  background: grey[100],
  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
}));

const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
});

const NavItems = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const MobileNavButton = styled(IconButton)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.down("md")]: {
    display: "block",
  },
}));

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { authUser } = useAuth();

  const pages = ["Home", "Products", "About", "Contact"];
  const settings = ["Profile", "Account", "Dashboard", "Logout"];

  const handleOpenUserMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const toggleMobileNav = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    console.log(authUser.isAuthenticated);
  });

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="xl">
        <StyledToolbar>
          <Logo sx={{fill: primary[800]}}/>

          <NavItems>
            {pages.map((page) => (
              <Button
                key={page}
                sx={{
                  color: primary[700],
                  fontWeight: 900,
                  "&:hover": { color: primary[900], backgroundColor: alpha(primary[100], 0.4) },
                  textTransform: "none",
                }}
                aria-label={`navigate to ${page.toLowerCase()}`}
              >
                {page}
              </Button>
            ))}
          </NavItems>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <NavItems>
              {authUser.isAuthenticated ? (
                <Tooltip title="Open settings">
                  <IconButton
                    onClick={handleOpenUserMenu}
                    aria-label="user settings"
                  >
                    <Avatar sx={{ bgcolor: primary[900] }}>
                      <FaUser />
                    </Avatar>
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    sx={{
                      color: primary[500],
                      borderColor: primary[500],
                      "&:hover": {
                        borderColor: primary[600],
                        color: primary[600],
                      },
                      textTransform: "none",
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
                      "&:hover": {
                        bgcolor: "transparent",
                        borderColor: primary[600],
                        color: primary[600],
                      },
                      textTransform: "none",
                    }}
                    aria-label="register"
                  >
                    Register
                  </Button>
                </>
              )}
            </NavItems>

            <MobileNavButton
              aria-label="open navigation menu"
              onClick={toggleMobileNav}
              sx={{ color: primary[900] }}
            >
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </MobileNavButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseUserMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </StyledToolbar>
      </Container>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleMobileNav}
        sx={{ display: { md: "none" } }}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {pages.map((page, index) => (
              <ListItem key={index}>
                <ListItemText primary={page} />
              </ListItem>
            ))}
            <ListItem>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Register" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </StyledAppBar>
  );
};

export default Header;
