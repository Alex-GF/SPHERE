import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Logo from '../../core/components/logo';
import { useAuth } from '../../auth/hooks/useAuth';
import MobileHeaderItems from './components/mobile-header-items';
import DesktopHeaderItems from './components/desktop-header-items';
import { headerRoutes } from './router/header-routes';
import { useRouter } from '../../core/hooks/useRouter';
import { useResponsive } from '../../core/hooks/useResponsive';

const Header = ({ setUploadModalOpen }: { setUploadModalOpen: (state: boolean) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userMenuContainerRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useResponsive('down', 'md');

  const { authUser, logout } = useAuth();
  const router = useRouter();

  const settings = [
    {
      name: 'My Pricings',
      onClick: () => {
        router.push('/me/pricings');
        handleCloseUserMenu();
      },
    },
    {
      name: 'Upload pricing',
      onClick: () => {
        setUploadModalOpen(true);
        handleCloseUserMenu();
      },
    },
    {
      name: 'Logout',
      onClick: () => {
        logout();
        handleCloseUserMenu();
        router.push('/');
      },
    },
  ];

  const handleToggleUserMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleCloseUserMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!userMenuContainerRef.current?.contains(event.target as Node)) {
        handleCloseUserMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseUserMenu();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-sphere-grey-100 shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-2">
          <Logo sx="fill-sphere-primary-800" />

          {isMobile ? (
            <MobileHeaderItems headerRoutes={headerRoutes} />
          ) : (
            <DesktopHeaderItems headerRoutes={headerRoutes} />
          )}

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-4 md:flex">
              {authUser.isAuthenticated ? (
                <div ref={userMenuContainerRef} className="relative">
                  <button
                    type="button"
                    onClick={handleToggleUserMenu}
                    aria-label="user settings"
                    aria-expanded={isMenuOpen}
                    className="h-10 w-10 overflow-hidden rounded-full border border-sphere-grey-300 bg-white"
                  >
                    {authUser.user?.avatar ? (
                      <img src={authUser.user.avatar} alt={authUser.user.firstName ?? 'User avatar'} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-bold text-sphere-primary-700">
                        {authUser.user?.firstName?.[0] ?? 'U'}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute right-0 top-full z-50 mt-2 w-[200px] origin-top-right rounded-md border border-sphere-grey-300 bg-white shadow-md"
                      >
                        <div className="mb-1 flex cursor-default flex-col items-center px-3 py-2 text-center">
                          <p className="mb-2 text-base font-bold">{authUser.user?.firstName}</p>
                          <div className="h-px w-[90%] bg-sphere-grey-500" />
                        </div>
                        {settings.map(setting => (
                          <button
                            key={setting.name}
                            type="button"
                            onClick={setting.onClick}
                            className="block w-full px-3 py-2 text-center transition-colors hover:bg-sphere-grey-100"
                          >
                            {setting.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="rounded-md border border-sphere-primary-500 px-4 py-2 text-sphere-primary-500 transition-colors hover:border-sphere-primary-600 hover:text-sphere-primary-600"
                    aria-label="login"
                    onClick={() => router.push('/login')}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-sphere-primary-800 bg-sphere-primary-800 px-4 py-2 text-sphere-primary-100 transition-colors hover:bg-transparent hover:text-sphere-primary-600"
                    aria-label="register"
                    onClick={() => router.push('/register')}
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
      </div>
    </header>
  );
};

export default Header;
