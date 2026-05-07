import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Iconify from '../../../core/components/iconify';
import { useOrganization } from '../../hooks/useOrganization';

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

const ROLE_STYLES: Record<string, string> = {
  OWNER: 'bg-sphere-primary-100 text-sphere-primary-800',
  ADMIN: 'bg-amber-100 text-amber-800',
  MEMBER: 'bg-sphere-grey-200 text-sphere-grey-700',
};

function OrgAvatar({
  org,
  size = 48,
}: {
  org: { avatar: string | null; displayName: string; isPersonal: boolean };
  size?: number;
}) {
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
      <Iconify icon={org.isPersonal ? 'mdi:account' : 'mdi:domain'} width={Math.round(size * 0.45)} />
    </span>
  );
}

export default function OrganizationsListPage() {
  const { organizations, activeOrganization, setActiveOrganization, isLoading } = useOrganization();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [organizations.length]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <span className="text-sphere-grey-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sphere-grey-800">My Organizations</h1>
        <Link
          to="/orgs/new"
          className="flex items-center gap-2 rounded-md bg-sphere-primary-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sphere-primary-700"
        >
          <Iconify icon="mdi:plus" width={18} />
          New Organization
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && organizations.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-sphere-grey-500">
          <Iconify icon="mdi:domain-off" width={40} />
          <p>No organizations yet.</p>
        </div>
      )}

      {!error && organizations.length > 0 && (
        <ul className="flex flex-col gap-3">
          {organizations.map((org) => (
            <li
              key={org.id}
              className="flex flex-col gap-3 rounded-lg border border-sphere-grey-300 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <OrgAvatar org={org} />
                <div className="min-w-0 flex-1">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-sphere-grey-800">
                    {org.displayName}
                  </p>
                  <p className="text-sm text-sphere-grey-600">@{org.name}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    org.isPersonal ? ROLE_STYLES.OWNER : ROLE_STYLES.MEMBER
                  }`}
                  title={org.isPersonal ? 'Personal organization' : undefined}
                >
                  {org.isPersonal ? ROLE_LABELS.OWNER : ROLE_LABELS.MEMBER}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveOrganization(org)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    activeOrganization?.id === org.id
                      ? 'border-sphere-primary-300 bg-sphere-primary-50 text-sphere-primary-800'
                      : 'border-sphere-grey-300 text-sphere-grey-700 hover:bg-sphere-grey-100'
                  }`}
                >
                  {activeOrganization?.id === org.id ? 'Active' : 'Set active'}
                </button>
                <Link
                  to={`/orgs/${org.id}`}
                  className="flex items-center gap-1 rounded-md border border-sphere-grey-300 px-3 py-1.5 text-sm font-semibold text-sphere-grey-700 transition-colors hover:bg-sphere-grey-100"
                >
                  Open
                  <Iconify icon="mdi:chevron-right" width={16} className="text-sphere-grey-400" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
