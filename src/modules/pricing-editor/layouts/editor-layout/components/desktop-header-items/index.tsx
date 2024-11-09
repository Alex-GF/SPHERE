import { useEffect, useState } from 'react';
import { alpha, Box, IconButton, Stack } from '@mui/material';
import { MdBrightness4, MdBrightness7 } from 'react-icons/md';
import { StyledButton } from '../styled-button';
import { MenuItems } from '../../header';
import { useMode } from '../../../../../core/hooks/useTheme';
import { grey, primary } from '../../../../../core/theme/palette';
import { RiArrowDropDownFill } from 'react-icons/ri';

export default function DesktopHeaderItems({ menuItems }: { menuItems: MenuItems[] }) {
  const { mode, setMode } = useMode();
  const [openedMenuItemChildren, setOpenedMenuItemChildren] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleColorMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const handleMenuItemChildrenEnter = (e: any) => {
    const itemName = e.target.getAttribute('aria-label');

    const updatedMenuItems: { [key: string]: boolean } = Object.keys(openedMenuItemChildren).reduce(
      (acc: { [key: string]: boolean }, key: string) => {
        acc[key] = key === itemName;
        return acc;
      },
      {}
    );

    setOpenedMenuItemChildren(updatedMenuItems);
  };

  const handleMenuItemChildrenLeave = (e: any) => {
    const updatedMenuItems: { [key: string]: boolean } = Object.keys(openedMenuItemChildren).reduce(
      (acc: { [key: string]: boolean }, key: string) => {
        acc[key] = false;
        return acc;
      },
      {}
    );

    setOpenedMenuItemChildren(updatedMenuItems);
  };

  useEffect(() => {
    const initialOpenedMenuItemChildren: { [key: string]: boolean } = {};

    for (const menuItem of menuItems) {
      initialOpenedMenuItemChildren[menuItem.name] = false;
    }

    setOpenedMenuItemChildren(initialOpenedMenuItemChildren);
  }, []);

  useEffect(() => {}, [openedMenuItemChildren]);

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{ flexGrow: 1, ml: 2 }}
        role="navigation"
        aria-label="Main navigation"
      >
        {menuItems.map((item, index) => (
          <Box
            sx={{ position: 'relative' }}
            key={index}
            onMouseEnter={item.children ? handleMenuItemChildrenEnter : () => {}}
            onMouseLeave={item.children ? handleMenuItemChildrenLeave : () => {}}
          >
            <StyledButton
              aria-label={item.name}
              tabIndex={0}
              mode={mode}
              onClick={item.onClick ? item.onClick : () => {}}
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
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  opacity: openedMenuItemChildren[item.name] ? 1 : 0,
                  maxHeight: openedMenuItemChildren[item.name] ? '2000px' : 0,
                  transition: 'all .5s ease',
                  overflow: 'hidden',
                  backgroundColor: mode === 'light' ? grey[200] : grey[600],
                  borderRadius: '5px',
                  padding: openedMenuItemChildren[item.name] ? '10px' : 0,
                  width: openedMenuItemChildren[item.name] ? '200px' : 0,
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
                    onClick={childItem.onClick}
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
          </Box>
        ))}
      </Stack>
      <Box>
        <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
          {mode === 'dark' ? (
            <MdBrightness4 fill={primary[100]} />
          ) : (
            <MdBrightness7 fill={primary[800]} />
          )}
        </IconButton>
      </Box>
    </>
  );
}
