import { useState } from 'react';
import { useRouter } from '../../../core/hooks/useRouter';
import UserMenu from './user-menu';
import MobileNav from './mobile-nav';
import CommandPalette from '../../../core/components/command-palette';

interface Props {
  onUploadPricing: () => void;
}

const NAV_ITEMS = [
  {
    label: 'Pricings',
    children: [
      { label: 'All Pricings', to: '/pricings' },
      { label: 'My Pricings', to: '/me/pricings' },
      { label: 'Collections', to: '/pricings/collections' },
    ],
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

export default function AppHeader({ onUploadPricing }: Props) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNavigate = (to: string) => {
    router.push(to);
    setOpenDropdown(null);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-tp-hairline-soft bg-tp-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between px-4 md:px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleNavigate('/')}
              className="text-sm font-semibold tracking-[0.22em] text-tp-ink transition-colors hover:text-tp-primary"
            >
              SPHERE
            </button>
          </div>

          {/* Center: Navigation (desktop) */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(item => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.children ? item.label : null)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (item.to) handleNavigate(item.to);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
                >
                  {item.label}
                  {item.children && (
                    <svg
                      className={`h-3.5 w-3.5 text-tp-ink transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {item.children && (
                  <div
                    className={`absolute left-0 top-full z-50 min-w-[200px] pt-1 transition-all ${
                      openDropdown === item.label
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-1 opacity-0'
                    }`}
                  >
                    <div className="rounded-lg border border-tp-hairline bg-tp-canvas py-1 shadow-elevation-4">
                      {item.children.map(child => (
                        <button
                          key={child.to}
                          type="button"
                          onClick={() => handleNavigate(child.to)}
                          className="block w-full px-3 py-2 text-left text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onUploadPricing}
              className="hidden items-center gap-1.5 rounded-md bg-tp-primary px-3 py-1.5 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep md:inline-flex"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>

            <div className="hidden md:block">
              <CommandPalette />
            </div>

            <div className="hidden md:block">
              <UserMenu onUploadPricing={onUploadPricing} />
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-tp-steel transition-colors hover:bg-tp-surface hover:text-tp-ink md:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onUploadPricing={onUploadPricing}
      />
    </>
  );
}
