import { useState } from 'react';
import { useRouter } from '../../../core/hooks/useRouter';
import UserMenu from './user-menu';
import MobileNav from './mobile-nav';
import CommandPalette from '../../../core/components/command-palette';

const NAV_ITEMS = [
  {
    label: 'Pricings',
    children: [
      { label: 'All Pricings', to: '/pricings' },
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

export default function AppHeader() {
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
              className="cursor-pointer text-sm font-semibold tracking-[0.22em] text-tp-ink transition-colors hover:text-tp-primary"
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
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
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
                          className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
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
            <div
              className="relative hidden md:block"
              onMouseEnter={() => setOpenDropdown('new')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-tp-primary px-3 py-1.5 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${openDropdown === 'new' ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`absolute right-0 top-full z-50 min-w-[180px] pt-1 transition-all ${
                  openDropdown === 'new'
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-1 opacity-0'
                }`}
              >
                <div className="rounded-lg border border-tp-hairline bg-tp-canvas py-1 shadow-elevation-4">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/pricings/new')}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pricing
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/pricings/collections/new')}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Collection
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/orgs/new')}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-tp-slate transition-colors hover:bg-tp-surface hover:text-tp-ink"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                    Organization
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <CommandPalette />
            </div>

            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-tp-steel transition-colors hover:bg-tp-surface hover:text-tp-ink md:hidden"
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
      />
    </>
  );
}
