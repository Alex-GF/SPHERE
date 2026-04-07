import { useEffect, useState } from 'react';
import { StyledButton } from '../styled-button';
import { HeaderRoute } from '../../router/header-routes';
import { useMode } from '../../../../core/hooks/useTheme';
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

  const handleMenuItemChildrenLeave = () => {
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
    <div
      className="ml-2 hidden flex-grow justify-start gap-2 md:flex"
      role="nav"
      aria-label="Main navigation"
    >
        {headerRoutes.map((item, index) => (
          <div
            className="relative"
            key={index}
            onMouseEnter={item.children ? handleMenuItemChildrenEnter : () => {}}
            onMouseLeave={item.children ? handleMenuItemChildrenLeave : () => {}}
          >
            <StyledButton
              aria-label={item.name}
              tabIndex={0}
              mode={mode}
              onClick={() => item.to ? router.push(item.to) : {}}
              className="cursor-pointer text-sphere-primary-700"
            >
              {item.name}
              {item.children && (
                <RiArrowDropDownFill
                  className="text-sphere-primary-700"
                  size="20px"
                  aria-label={item.name}
                />
              )}
            </StyledButton>
            {item.children && (
              <div
                className={`absolute left-0 top-full overflow-hidden rounded-[5px] bg-sphere-grey-200 shadow-[0px_2px_10px_rgba(0,0,0,0.2)] transition-all duration-500 ${openedMenuItemChildren[item.name] ? 'pointer-events-auto w-[200px] max-h-[2000px] p-[10px] opacity-100' : 'pointer-events-none w-0 max-h-0 p-0 opacity-0'}`}
              >
                {item.children.map((childItem, childIndex) => (
                  <StyledButton
                    key={childIndex}
                    aria-label={childItem.name}
                    tabIndex={0}
                    mode={mode}
                    onClick={() => childItem.to ? router.push(childItem.to) : {}}
                    className="w-full bg-transparent text-left text-sphere-primary-700 hover:bg-[rgba(202,240,248,0.8)] hover:text-sphere-primary-800"
                  >
                    {childItem.name}
                  </StyledButton>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
