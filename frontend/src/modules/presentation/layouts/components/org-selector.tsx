import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Iconify from '../../../core/components/iconify';
import { useOrganization } from '../../../organization/hooks/useOrganization';
import type { Organization } from '../../../organization/api/organizationsApi';

function OrgAvatar({ org, size = 22 }: { org: Organization; size?: number }) {
  if (org.avatar) {
    return (
      <img
        src={org.avatar}
        alt={org.displayName}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="flex items-center justify-center rounded-full bg-sphere-primary-800 text-white"
      style={{ width: size, height: size }}
    >
      <Iconify icon={org.isPersonal ? 'mdi:account' : 'mdi:domain'} width={Math.round(size * 0.65)} />
    </span>
  );
}

export default function OrgSelector() {
  const { organizations, activeOrganization, setActiveOrganization, isLoading } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
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
  }, [isOpen]);

  if (isLoading || !activeOrganization) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="select organization"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-lg border border-sphere-grey-300 bg-white px-2.5 py-1 text-sm font-medium transition-colors hover:border-sphere-grey-400 hover:bg-sphere-grey-200"
      >
        <OrgAvatar org={activeOrganization} size={22} />
        <span className="max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
          {activeOrganization.displayName}
        </span>
        <Iconify icon="mdi:chevron-down" width={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 top-full z-50 mt-2 min-w-[240px] origin-top-left rounded-md border border-sphere-grey-300 bg-white shadow-md"
          >
            <div className="px-3 py-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-sphere-grey-600">Organizations</p>
            </div>
            <div className="border-b border-sphere-grey-300" />
            {organizations.map((org) => (
              <button
                key={org.id}
                type="button"
                onClick={() => {
                  setActiveOrganization(org);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-sphere-grey-100 ${
                  org.id === activeOrganization.id ? 'bg-sphere-grey-100' : ''
                }`}
              >
                <OrgAvatar org={org} size={28} />
                <div className="min-w-0">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                    {org.displayName}
                  </p>
                  {org.isPersonal ? (
                    <p className="text-xs text-sphere-grey-600">Personal</p>
                  ) : (
                    <p className="text-xs text-sphere-grey-500">@{org.name}</p>
                  )}
                </div>
                {org.id === activeOrganization.id && (
                  <Iconify icon="mdi:check" width={16} className="ml-auto shrink-0 text-sphere-primary-700" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
