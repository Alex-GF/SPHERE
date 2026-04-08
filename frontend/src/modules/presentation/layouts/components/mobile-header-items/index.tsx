import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useMode } from '../../../../core/hooks/useTheme';
import { HeaderRoute } from '../../router/header-routes';
import { RiArrowDropDownFill } from 'react-icons/ri';
import { StyledButton } from '../styled-button';
import { useRouter } from '../../../../core/hooks/useRouter';

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
      <div className="flex-grow" />
      <button
        aria-label="open navigation menu"
        onClick={toggleMobileNav}
        className="block p-2 text-sphere-primary-900 md:hidden"
      >
        {mobileOpen ? (
          <FaTimes className="text-sphere-primary-700" />
        ) : (
          <FaBars className="text-sphere-primary-700" />
        )}
      </button>

      {mobileOpen && (
      <div className="fixed inset-0 z-50 md:hidden" onClick={toggleMobileNav} role="presentation">
        <div className="ml-auto h-full w-[250px] bg-sphere-grey-100 pt-2" onClick={(e) => e.stopPropagation()} role="presentation">
          <div>
            {headerRoutes.map((item, index) => (
              <div
                key={index}
                className="flex flex-col font-black text-sphere-primary-800"
              >
                <StyledButton
                  key={index}
                  aria-label={item.name}
                  tabIndex={0}
                  mode={mode}
                  onClick={item.children ? handleMenuItemChildrenClick : () => item.to ? router.push(item.to) : {}}
                  className="flex w-full items-center justify-center gap-1"
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
                    className={`w-full overflow-hidden rounded-[5px] bg-sphere-grey-200 shadow-[0px_2px_10px_rgba(0,0,0,0.2)] transition-all duration-500 ${openedMenuItemChildren[item.name] ? 'pointer-events-auto max-h-[2000px] p-[10px]' : 'pointer-events-none max-h-0 p-0'}`}
                  >
                    {item.children.map((childItem, childIndex) => (
                      <StyledButton
                        key={childIndex}
                        aria-label={childItem.name}
                        tabIndex={0}
                        mode={mode}
                        onClick={() => childItem.to ? router.push(childItem.to) : {}}
                        className="flex w-full items-center justify-center bg-transparent text-center text-sphere-primary-700 hover:bg-[rgba(202,240,248,0.8)] hover:text-sphere-primary-800"
                      >
                        {childItem.name}
                      </StyledButton>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={`h-full w-full ${mode === 'light' ? 'bg-sphere-grey-100' : 'bg-black'}`} />
        </div>
      </div>
      )}
    </>
  );
}
