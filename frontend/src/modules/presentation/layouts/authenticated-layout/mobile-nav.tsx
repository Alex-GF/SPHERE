import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from '../../../core/hooks/useRouter';
import { useAuth } from '../../../auth/hooks/useAuth';
import { staggerContainer, menuItemVariants, transitionFast } from '../../../core/utils/motion-variants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUploadPricing: () => void;
}

const NAV_STRUCTURE = [
  {
    label: 'Pricings',
    children: [
      { label: 'All Pricings', to: '/pricings' },
      { label: 'My Pricings', to: '/me/pricings' },
      { label: 'Collections', to: '/pricings/collections' },
    ],
  },
  {
    label: 'Organizations',
    to: '/me/orgs',
  },
  {
    label: 'Tools',
    children: [
      { label: 'Pricing2Yaml Editor', to: '/editor' },
      { label: 'HARVEY', to: '/harvey' },
      { label: 'HARVEY Playground', to: '/harvey-play' },
    ],
  },
  { label: 'Team', to: '/team' },
  { label: 'Research', to: '/research' },
];

export default function MobileNav({ isOpen, onClose, onUploadPricing }: Props) {
  const router = useRouter();
  const { authUser, logout } = useAuth();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const handleNavigate = (to: string) => {
    router.push(to);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-tp-ink/20 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-[300px] bg-tp-canvas shadow-elevation-4"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-tp-hairline-soft px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-[0.22em] text-tp-ink">SPHERE</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-tp-steel transition-colors hover:bg-tp-surface hover:text-tp-ink"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User info */}
              {authUser.isAuthenticated && (
                <div className="border-b border-tp-hairline-soft px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tp-cream text-sm font-semibold text-tp-primary">
                      {authUser.user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-tp-ink">{authUser.user?.firstName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav items */}
              <motion.nav
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto px-3 py-4"
              >
                {NAV_STRUCTURE.map(item => (
                  <motion.div key={item.label} variants={menuItemVariants} transition={transitionFast}>
                    {item.children ? (
                      <div className="mb-1">
                        <button
                          type="button"
                          onClick={() => setExpandedGroup(prev => prev === item.label ? null : item.label)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-tp-ink transition-colors hover:bg-tp-surface"
                        >
                          {item.label}
                          <svg
                            className={`h-4 w-4 text-tp-steel transition-transform ${expandedGroup === item.label ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <AnimatePresence>
                          {expandedGroup === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-3 border-l border-tp-hairline-soft py-1 pl-3">
                                {item.children.map(child => (
                                  <button
                                    key={child.to}
                                    type="button"
                                    onClick={() => handleNavigate(child.to)}
                                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
                                  >
                                    {child.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNavigate(item.to!)}
                        className="mb-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-tp-ink transition-colors hover:bg-tp-surface"
                      >
                        {item.label}
                      </button>
                    )}
                  </motion.div>
                ))}
              </motion.nav>

              {/* Footer actions */}
              <div className="border-t border-tp-hairline-soft px-3 py-3">
                <button
                  type="button"
                  onClick={() => {
                    onUploadPricing();
                    onClose();
                  }}
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-tp-hairline-strong bg-tp-canvas px-4 py-2.5 text-sm font-medium text-tp-ink transition-colors hover:bg-tp-surface"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload pricing
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm text-tp-steel transition-colors hover:bg-tp-surface hover:text-tp-ink"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
