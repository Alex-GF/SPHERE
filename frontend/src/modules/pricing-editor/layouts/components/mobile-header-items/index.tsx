import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useMode } from '../../../../core/hooks/useTheme';
import { primary } from '../../../../core/theme/palette';
import { MenuItems } from '../../header';
import { RiArrowDropDownFill } from 'react-icons/ri';

export default function MobileHeaderItems({ menuItems }: { menuItems: MenuItems[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openedMenuItemChildren, setOpenedMenuItemChildren] = useState<{ [key: string]: boolean }>(
    {}
  );

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

    for (const menuItem of menuItems) {
      initialOpenedMenuItemChildren[menuItem.name] = false;
    }

    setOpenedMenuItemChildren(initialOpenedMenuItemChildren);
  }, []);

  return (
    <>
      <div className="flex-1" />
      <button
        type="button"
        aria-label="open navigation menu"
        onClick={toggleMobileNav}
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-900 md:hidden"
      >
        {mobileOpen ? (
          <FaTimes fill={mode === 'light' ? primary[700] : primary[100]} />
        ) : (
          <FaBars fill={mode === 'light' ? primary[700] : primary[100]} />
        )}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="close navigation menu" className="absolute inset-0 bg-black/40" onClick={toggleMobileNav} />
          <div className="absolute right-0 top-0 h-full w-72 bg-slate-50 p-4 shadow-2xl">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col py-2 text-sm font-semibold text-slate-900"
              >
                <button
                  type="button"
                  aria-label={item.name}
                  tabIndex={0}
                  onClick={item.children ? handleMenuItemChildrenClick : item.onClick}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-slate-200"
                >
                  {item.name}
                  {item.children && (
                    <RiArrowDropDownFill
                      fill={mode === 'light' ? primary[700] : primary[100]}
                      size="20px"
                      aria-label={item.name}
                    />
                  )}
                </button>
                {item.children && (
                  <div
                    className={`mt-2 w-full overflow-hidden rounded-md bg-slate-200 shadow transition-all duration-300 ${openedMenuItemChildren[item.name] ? 'max-h-[2000px] p-2 opacity-100' : 'max-h-0 p-0 opacity-0 pointer-events-none'}`}
                  >
                    {item.children.map((childItem, childIndex) => (
                      <button
                        type="button"
                        key={childIndex}
                        aria-label={childItem.name}
                        tabIndex={0}
                        onClick={childItem.onClick}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      >
                        {childItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
