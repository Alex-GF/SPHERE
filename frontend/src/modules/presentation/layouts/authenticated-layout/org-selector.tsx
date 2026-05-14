import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOrganization } from '../../../organization/hooks/useOrganization';
import { dropdownVariants, transitionFast } from '../../../core/utils/motion-variants';

export default function OrgSelector() {
  const { organizations, activeOrganization, setActiveOrganization, isLoading } = useOrganization();
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

  if (isLoading || organizations.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-tp-ink transition-colors hover:bg-tp-surface"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-tp-cream text-[10px] font-bold text-tp-primary">
          {activeOrganization?.name?.[0]?.toUpperCase() ?? 'O'}
        </span>
        <span className="max-w-[140px] truncate">{activeOrganization?.name ?? 'Organization'}</span>
        <svg
          className={`h-4 w-4 text-tp-steel transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transitionFast}
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1 w-[240px] origin-top-left rounded-lg border border-tp-hairline bg-tp-canvas py-1 shadow-elevation-4"
          >
            <div className="border-b border-tp-hairline-soft px-3 py-2">
              <p className="text-xs font-medium text-tp-steel">Switch organization</p>
            </div>

            <div className="max-h-[280px] overflow-y-auto py-1">
              {organizations.map(org => (
                <button
                  key={org.id}
                  type="button"
                  role="option"
                  aria-selected={org.id === activeOrganization?.id}
                  onClick={() => {
                    setActiveOrganization(org);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-tp-surface ${
                    org.id === activeOrganization?.id ? 'bg-tp-surface font-medium text-tp-ink' : 'text-tp-slate'
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-tp-cream text-[11px] font-bold text-tp-primary">
                    {org.name?.[0]?.toUpperCase() ?? 'O'}
                  </span>
                  <span className="truncate">{org.name}</span>
                  {org.id === activeOrganization?.id && (
                    <svg className="ml-auto h-4 w-4 shrink-0 text-tp-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-tp-hairline-soft">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/orgs/new';
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-tp-primary transition-colors hover:bg-tp-surface"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create organization
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
