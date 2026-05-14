import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useRouter } from '../../../core/hooks/useRouter';
import { dropdownVariants, transitionFast } from '../../../core/utils/motion-variants';

interface Props {
  onUploadPricing: () => void;
}

export default function UserMenu({ onUploadPricing }: Props) {
  const { authUser, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const menuItems = [
    {
      label: 'My Pricings',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      onClick: () => {
        router.push('/me/pricings');
        setIsOpen(false);
      },
    },
    {
      label: 'Organizations',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
      onClick: () => {
        router.push('/me/orgs');
        setIsOpen(false);
      },
    },
    {
      label: 'Upload pricing',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      ),
      onClick: () => {
        onUploadPricing();
        setIsOpen(false);
      },
    },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  const initials = authUser.user?.firstName?.[0]?.toUpperCase() ?? 'U';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="User menu"
        aria-expanded={isOpen}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-tp-hairline bg-tp-cream text-sm font-semibold text-tp-primary transition-all hover:ring-2 hover:ring-tp-primary/20"
      >
        {authUser.user?.avatar ? (
          <img
            src={authUser.user.avatar}
            alt={authUser.user.firstName ?? 'User'}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transitionFast}
            className="absolute right-0 top-full z-50 mt-2 w-[200px] origin-top-right rounded-lg border border-tp-hairline bg-tp-canvas py-1 shadow-elevation-4"
          >
            <div className="border-b border-tp-hairline-soft px-3 py-2.5">
              <p className="text-sm font-medium text-tp-ink">{authUser.user?.firstName}</p>
              <p className="text-xs text-tp-steel">{authUser.user?.email}</p>
            </div>

            {menuItems.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <div className="border-t border-tp-hairline-soft">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
