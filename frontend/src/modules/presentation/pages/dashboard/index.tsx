import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useOrganization } from '../../../organization/hooks/useOrganization';
import { usePricingsApi } from '../../../pricing/api/pricingsApi';
import { usePricingCollectionsApi } from '../../../profile/api/pricingCollectionsApi';
import { useRouter } from '../../../core/hooks/useRouter';
import { staggerContainer, fadeInUp, transitionDefault } from '../../../core/utils/motion-variants';

interface PricingEntry {
  name: string;
  version: string;
  createdAt: string;
  currency: string;
  organization: { id: string; name: string; displayName: string; avatar: string };
  collection: { id: string; name: string; slug: string } | null;
}

interface CollectionEntry {
  id: string;
  name: string;
  slug: string;
  organization: { id: string; name: string; displayName: string; avatar: string };
  numberOfPricings: number;
}

export default function DashboardPage() {
  const { authUser } = useAuth();
  const { organizations } = useOrganization();
  const { getLoggedUserPricings } = usePricingsApi();
  const { getLoggedUserCollections } = usePricingCollectionsApi();
  const router = useRouter();

  const [pricings, setPricings] = useState<PricingEntry[]>([]);
  const [collections, setCollections] = useState<CollectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authUser.isAuthenticated) return;

    Promise.all([
      getLoggedUserPricings().catch(() => ({ pricings: [] })),
      getLoggedUserCollections().catch(() => ({ collections: [] })),
    ]).then(([pricingsData, collectionsData]) => {
      setPricings(pricingsData.pricings ?? []);
      setCollections(collectionsData.collections ?? []);
      setIsLoading(false);
    });
  }, [authUser.isAuthenticated]);

  const firstName = authUser.user?.firstName ?? 'there';

  const stats = [
    {
      label: 'Organizations',
      value: organizations.length,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
      color: 'bg-tp-primary/10 text-tp-primary',
    },
    {
      label: 'My Pricings',
      value: pricings.length,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Collections',
      value: collections.length,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      ),
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const quickActions = [
    {
      label: 'Browse Pricings',
      description: 'Explore all public pricings in the SPHERE',
      to: '/pricings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
    },
    {
      label: 'Pricing Editor',
      description: 'Create and edit pricings with live preview',
      to: '/editor',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
    {
      label: 'HARVEY Assistant',
      description: 'Ask AI about pricing strategies and analysis',
      to: '/harvey',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      ),
    },
    {
      label: 'New Organization',
      description: 'Create a new organization to collaborate',
      to: '/orgs/new',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitionDefault}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-normal text-tp-ink">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-tp-steel">
          Here's an overview of your SPHERE workspace.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {stats.map(stat => (
          <motion.div
            key={stat.label}
            variants={fadeInUp}
            transition={transitionDefault}
            className="flex items-center gap-4 rounded-xl border border-tp-hairline-soft bg-tp-canvas p-4"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-semibold text-tp-ink">{isLoading ? '—' : stat.value}</p>
              <p className="text-xs text-tp-steel">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Organizations */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionDefault, delay: 0.1 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-tp-ink">Your Organizations</h2>
              <button
                type="button"
                onClick={() => router.push('/me/orgs')}
                className="text-xs text-tp-primary hover:underline"
              >
                View all
              </button>
            </div>

            {organizations.length === 0 ? (
              <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas p-6 text-center">
                <p className="text-sm text-tp-steel">No organizations yet</p>
                <button
                  type="button"
                  onClick={() => router.push('/orgs/new')}
                  className="mt-2 text-sm font-medium text-tp-primary hover:underline"
                >
                  Create your first organization
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {organizations.slice(0, 4).map(org => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => router.push(`/orgs/${org.id}`)}
                    className="flex items-center gap-3 rounded-xl border border-tp-hairline-soft bg-tp-canvas p-4 text-left transition-all hover:border-tp-hairline-strong hover:shadow-elevation-1"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tp-cream text-sm font-bold text-tp-primary">
                      {org.name?.[0]?.toUpperCase() ?? 'O'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-tp-ink">{org.displayName || org.name}</p>
                      <p className="text-[11px] text-tp-steel">
                        {org.isPersonal ? 'Personal' : 'Team'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.section>

          {/* Recent Pricings */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionDefault, delay: 0.2 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-tp-ink">Recent Pricings</h2>
              <button
                type="button"
                onClick={() => router.push('/me/pricings')}
                className="text-xs text-tp-primary hover:underline"
              >
                View all
              </button>
            </div>

            {pricings.length === 0 ? (
              <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas p-6 text-center">
                <p className="text-sm text-tp-steel">No pricings yet</p>
                <button
                  type="button"
                  onClick={() => router.push('/editor')}
                  className="mt-2 text-sm font-medium text-tp-primary hover:underline"
                >
                  Create your first pricing
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {pricings.slice(0, 5).map(pricing => (
                  <button
                    key={`${pricing.organization.name}-${pricing.name}`}
                    type="button"
                    onClick={() => router.push(`/pricings/${pricing.organization.name}/${pricing.name}`)}
                    className="flex w-full items-center justify-between rounded-xl border border-tp-hairline-soft bg-tp-canvas px-4 py-3 text-left transition-all hover:border-tp-hairline-strong hover:shadow-elevation-1"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-tp-ink">{pricing.name}</p>
                      <p className="text-[11px] text-tp-steel">
                        v{pricing.version} · {pricing.currency}
                        {pricing.collection?.name && ` · ${pricing.collection.name}`}
                      </p>
                    </div>
                    <span className="text-[11px] text-tp-muted">
                      {new Date(pricing.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.section>

          {/* Recent Collections */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitionDefault, delay: 0.3 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-tp-ink">Recent Collections</h2>
              <button
                type="button"
                onClick={() => router.push('/pricings/collections')}
                className="text-xs text-tp-primary hover:underline"
              >
                View all
              </button>
            </div>

            {collections.length === 0 ? (
              <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas p-6 text-center">
                <p className="text-sm text-tp-steel">No collections yet</p>
                <button
                  type="button"
                  onClick={() => router.push('/pricings/collections/new')}
                  className="mt-2 text-sm font-medium text-tp-primary hover:underline"
                >
                  Create a collection
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {collections.slice(0, 5).map(collection => (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => router.push(`/pricings/collections/${collection.organization.id}/${collection.slug || collection.name}`)}
                    className="flex w-full items-center justify-between rounded-xl border border-tp-hairline-soft bg-tp-canvas px-4 py-3 text-left transition-all hover:border-tp-hairline-strong hover:shadow-elevation-1"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-tp-ink">{collection.name}</p>
                      <p className="text-[11px] text-tp-steel">
                        {collection.numberOfPricings} {collection.numberOfPricings === 1 ? 'pricing' : 'pricings'}
                      </p>
                    </div>
                    <span className="text-[11px] text-tp-muted">
                      {collection.organization.displayName || collection.organization.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.section>
        </div>

        {/* Right column — Quick Actions */}
        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...transitionDefault, delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-tp-ink">Quick Actions</h2>

          {quickActions.map(action => (
            <button
              key={action.to}
              type="button"
              onClick={() => router.push(action.to)}
              className="flex w-full items-center gap-3 rounded-xl border border-tp-hairline-soft bg-tp-canvas p-4 text-left transition-all hover:border-tp-primary/30 hover:shadow-elevation-1"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tp-surface text-tp-steel">
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-tp-ink">{action.label}</p>
                <p className="text-[11px] text-tp-steel">{action.description}</p>
              </div>
            </button>
          ))}
        </motion.aside>
      </div>
    </div>
  );
}
