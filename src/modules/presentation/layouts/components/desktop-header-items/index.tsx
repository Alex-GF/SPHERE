import { useEffect, useState } from 'react';
import { alpha, Box, Stack } from '@mui/material';
import { StyledButton } from '../styled-button';
import { HeaderRoute } from '../../router/header-routes';
import { useMode } from '../../../../core/hooks/useTheme';
import { grey, primary } from '../../../../core/theme/palette';
import { RiArrowDropDownFill } from 'react-icons/ri';
import { useRouter } from '../../../../core/hooks/useRouter';

export default function DesktopHeaderItems({ headerRoutes }: { headerRoutes: HeaderRoute[] }) {
  const { mode } = useMode();
  const [openedMenuItemChildren, setOpenedMenuItemChildren] = useState<{ [key: string]: boolean }>(
    {}
  );

  const router = useRouter();

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

    for (const menuItem of headerRoutes) {
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
        sx={{ flexGrow: 1, ml: 2, display: 'flex', justifyContent: 'flex-start' }}
        role="nav"
        aria-label="Main navigation"
      >
        {headerRoutes.map((item, index) => (
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
              onClick={() => item.to ? router.push(item.to) : {}}
              sx={{cursor: 'pointer', color: primary[700]}}
            >
              {item.name}
              {item.children && (
                <RiArrowDropDownFill
                  fill={primary[700]}
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
                  backgroundColor: grey[200],
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
                    onClick={() => childItem.to ? router.push(childItem.to) : {}}
                    sx={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      color: primary[700],
                      '&:hover': {
                        backgroundColor: alpha(primary[100], 0.8),
                        color: primary[800],
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
    </>
  );
}
