import { Box, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useMode } from '../../../../../core/hooks/useTheme';
import { grey, primary } from '../../../../../core/theme/palette';
import { HeaderRoute } from '../../router/header-routes';
import { styled, alpha } from '@mui/system';
import { RiArrowDropDownFill } from 'react-icons/ri';
import { StyledButton } from '../styled-button';
import { useRouter } from '../../../../../core/hooks/useRouter';

const MobileNavButton = styled(IconButton)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

export default function MobileHeaderItems({ headerRoutes }: { headerRoutes: HeaderRoute[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openedMenuItemChildren, setOpenedMenuItemChildren] = useState<{ [key: string]: boolean }>(
    {}
  );

  const router = useRouter();
  const { mode } = useMode();

  const toggleMobileNav = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemChildrenClick = (e: any) => {
    const itemName = e.target.getAttribute('aria-label');

    const updatedMenuItems: { [key: string]: boolean } = Object.keys(openedMenuItemChildren).reduce(
      (acc: { [key: string]: boolean }, key: string) => {
        acc[key] = key === itemName && !openedMenuItemChildren[key];
        return acc;
      },
      {}
    );

    setOpenedMenuItemChildren(updatedMenuItems);
  };

  useEffect(() => {
    const initialOpenedMenuItemChildren: { [key: string]: boolean } = {};

    for (const menuItem of headerRoutes) {
      initialOpenedMenuItemChildren[menuItem.name] = false;
    }

    setOpenedMenuItemChildren(initialOpenedMenuItemChildren);
  }, []);

  return (
    <>
      <Box sx={{ flexGrow: 1 }} />
      <MobileNavButton
        aria-label="open navigation menu"
        onClick={toggleMobileNav}
        sx={{ color: primary[900] }}
      >
        {mobileOpen ? (
          <FaTimes fill={mode === 'light' ? primary[700] : primary[100]} />
        ) : (
          <FaBars fill={mode === 'light' ? primary[700] : primary[100]} />
        )}
      </MobileNavButton>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleMobileNav}
        sx={{
          display: { md: 'none' },
        }}
      >
        <Box sx={{ width: 250, pt: 2, backgroundColor: mode === 'light' ? grey[100] : 'black' }}>
          <List>
            {headerRoutes.map((item, index) => (
              <ListItem
                key={index}
                sx={{
                  color: mode === 'light' ? primary[800] : primary[100],
                  fontWeight: 900,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <StyledButton
                  key={index}
                  aria-label={item.name}
                  tabIndex={0}
                  mode={mode}
                  onClick={() => item.to ? router.push(item.to) : {}}
                  sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
                >
                  {item.name}
                  {item.children && (
                    <RiArrowDropDownFill
                      fill={mode === 'light' ? primary[700] : primary[100]}
                      size="20px"
                      aria-label={item.name}
                    />
                  )}
                </StyledButton>
                {item.children && (
                  <Box
                    sx={{
                      maxHeight: openedMenuItemChildren[item.name] ? '2000px' : 0,
                      transition: 'all .5s ease',
                      overflow: 'hidden',
                      backgroundColor: mode === 'light' ? grey[200] : grey[600],
                      borderRadius: '5px',
                      padding: openedMenuItemChildren[item.name] ? '10px' : 0,
                      width: '100%',
                      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
                      pointerEvents: openedMenuItemChildren[item.name] ? 'auto' : 'none',
                    }}
                  >
                    {item.children.map((childItem, childIndex) => (
                      <StyledButton
                        key={childIndex}
                        aria-label={childItem.name}
                        tabIndex={0}
                        mode={mode}
                        onClick={() => childItem.to ? router.push(childItem.to) : {}}
                        sx={{
                          width: '100%',
                          backgroundColor: 'transparent',
                          color: mode === 'light' ? primary[700] : primary[300],
                          '&:hover': {
                            backgroundColor: alpha(primary[100], 0.8),
                            color: mode === 'light' ? primary[800] : grey[900],
                          },
                        }}
                      >
                        {childItem.name}
                      </StyledButton>
                    ))}
                  </Box>
                )}
              </ListItem>
            ))}
            {/* <ListItem>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Register" />
            </ListItem> */}
          </List>
        </Box>
        <Box
          sx={{
            height: '100%',
            width: '100%',
            backgroundColor: mode === 'light' ? grey[100] : 'black',
          }}
        />
      </Drawer>
    </>
  );
}
