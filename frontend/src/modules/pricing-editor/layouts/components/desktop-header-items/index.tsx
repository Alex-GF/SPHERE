import { useEffect, useRef, useState } from 'react';
import { MdBrightness4, MdBrightness7 } from 'react-icons/md';
import { MenuItems } from '../../header';
import { useMode } from '../../../../core/hooks/useTheme';
import { primary } from '../../../../core/theme/palette';
import { RiArrowDropDownFill } from 'react-icons/ri';

export default function DesktopHeaderItems({ menuItems }: { menuItems: MenuItems[] }) {
  const { mode, setMode } = useMode();
  const [openedMenu, setOpenedMenu] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleColorMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMenuItemChildrenEnter = (itemName: string) => {
    clearCloseTimer();
    setOpenedMenu(itemName);
  };

  const handleMenuItemChildrenLeave = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenedMenu(null);
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (openedMenu && !menuItems.some(item => item.name === openedMenu)) {
      setOpenedMenu(null);
    }
  }, [menuItems, openedMenu]);

  const itemTextClasses =
    mode === 'light'
      ? 'text-[#0077b6] hover:bg-[#e7f3fb] hover:text-[#023e8a]'
      : 'text-[#d7f7ff] hover:bg-[#273547] hover:text-[#8fe8ff]';

  const dropdownSurfaceClasses =
    mode === 'light'
      ? 'bg-white border border-slate-200 shadow-[0_10px_30px_rgba(2,62,138,0.18)]'
      : 'bg-[#5f7386] border border-[#6f879b] shadow-[0_12px_28px_rgba(0,0,0,0.45)]';

  const dropdownItemClasses =
    mode === 'light'
      ? 'text-[#0077b6] hover:bg-[#e7f3fb] hover:text-[#023e8a]'
      : 'text-[#8fe8ff] hover:bg-[#70869a] hover:text-[#caf0f8]';

  return (
    <>
      <nav className="flex flex-1 items-center gap-2 pl-2" aria-label="Main navigation">
        {menuItems.map((item, index) => (
          <div
            className="relative"
            key={index}
            onMouseEnter={item.children ? () => handleMenuItemChildrenEnter(item.name) : undefined}
            onMouseLeave={item.children ? handleMenuItemChildrenLeave : () => {}}
          >
            <button
              type="button"
              aria-label={item.name}
              tabIndex={0}
              onClick={item.onClick ? item.onClick : () => {}}
              className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition ${itemTextClasses}`}
            >
              {item.name}
              {item.children && (
                <RiArrowDropDownFill
                  fill={mode === 'light' ? primary[700] : '#8fe8ff'}
                  size="20px"
                  aria-label={item.name}
                />
              )}
            </button>
            {item.children && (
              <div
                className={`absolute left-0 top-full z-50 w-56 pt-2 transition-all duration-200 ${openedMenu === item.name ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0 pointer-events-none'}`}
              >
                <div className={`overflow-hidden rounded-md p-2 ${dropdownSurfaceClasses}`}>
                  {item.children.map((childItem, childIndex) => (
                    <button
                      type="button"
                      key={childIndex}
                      aria-label={childItem.name}
                      tabIndex={0}
                      onClick={childItem.onClick}
                      className={`block w-full rounded-md px-3 py-2 text-center text-sm font-semibold transition ${dropdownItemClasses}`}
                    >
                      {childItem.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
      <div>
        <button
          type="button"
          className={`ml-1 rounded-md p-2 transition ${mode === 'light' ? 'hover:bg-[#e7f3fb]' : 'hover:bg-[#273547]'}`}
          onClick={toggleColorMode}
        >
          {mode === 'dark' ? (
            <MdBrightness4 size={30} fill="#8fe8ff" />
          ) : (
            <MdBrightness7 size={30} fill={primary[800]} />
          )}
        </button>
      </div>
    </>
  );
}
