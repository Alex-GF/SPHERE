import { useEffect, useState } from 'react';
import { MdBrightness4, MdBrightness7 } from 'react-icons/md';
import { MenuItems } from '../../header';
import { useMode } from '../../../../core/hooks/useTheme';
import { grey, primary } from '../../../../core/theme/palette';
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

    for (const menuItem of menuItems) {
      initialOpenedMenuItemChildren[menuItem.name] = false;
    }

    setOpenedMenuItemChildren(initialOpenedMenuItemChildren);
  }, []);

  useEffect(() => {}, [openedMenuItemChildren]);

  return (
    <>
      <nav className="flex flex-1 items-center gap-2 pl-2" aria-label="Main navigation">
        {menuItems.map((item, index) => (
          <div
            className="relative"
            key={index}
            onMouseEnter={item.children ? handleMenuItemChildrenEnter : () => {}}
            onMouseLeave={item.children ? handleMenuItemChildrenLeave : () => {}}
          >
            <button
              type="button"
              aria-label={item.name}
              tabIndex={0}
              onClick={item.onClick ? item.onClick : () => {}}
              className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition ${mode === 'light' ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-100 hover:bg-slate-800 hover:text-white'}`}
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
                className={`absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-md shadow-lg transition-all duration-300 ${openedMenuItemChildren[item.name] ? 'max-h-[2000px] bg-slate-200 p-2 opacity-100' : 'max-h-0 w-0 p-0 opacity-0 pointer-events-none'}`}
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
      </nav>
      <div>
        <button type="button" className="ml-1 rounded-md p-2 hover:bg-slate-100" onClick={toggleColorMode}>
          {mode === 'dark' ? (
            <MdBrightness4 fill={primary[100]} />
          ) : (
            <MdBrightness7 fill={primary[800]} />
          )}
        </button>
      </div>
    </>
  );
}
