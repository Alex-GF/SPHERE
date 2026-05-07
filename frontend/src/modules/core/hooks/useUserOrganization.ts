import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

const ORGS_BASE_PATH = import.meta.env.VITE_API_URL + '/users/me/orgs';

export interface Organization {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  avatar: string | null;
  isPersonal: boolean;
  createdAt: string;
  updatedAt: string;
}

let cachedPersonalOrganization: Organization | null = null;
let fetchPromise: Promise<Organization | null> | null = null;

export function useUserOrganization() {
  const { authUser, fetchWithInterceptor } = useAuth();
  const [personalOrganization, setPersonalOrganization] = useState<Organization | null>(
    cachedPersonalOrganization
  );
  const [loading, setLoading] = useState<boolean>(!cachedPersonalOrganization);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonalOrganization = useCallback(async () => {
    if (cachedPersonalOrganization) {
      setPersonalOrganization(cachedPersonalOrganization);
      setLoading(false);
      return cachedPersonalOrganization;
    }

    if (fetchPromise) {
      const org = await fetchPromise;
      setPersonalOrganization(org);
      setLoading(false);
      return org;
    }

    fetchPromise = (async () => {
      try {
        const response = await fetchWithInterceptor(ORGS_BASE_PATH, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authUser.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }

        const orgs: Organization[] = await response.json();
        const personalOrg = orgs.find(
          (org) => org.isPersonal && org.name === authUser.user?.username
        );

        if (personalOrg) {
          cachedPersonalOrganization = personalOrg;
          setPersonalOrganization(personalOrg);
          return personalOrg;
        }

        return null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      } finally {
        setLoading(false);
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  }, [authUser, fetchWithInterceptor]);

  useEffect(() => {
    if (authUser.isAuthenticated && authUser.user && !cachedPersonalOrganization) {
      fetchPersonalOrganization();
    }
  }, [authUser.isAuthenticated, authUser.user, fetchPersonalOrganization]);

  return { personalOrganization, loading, error, refetch: fetchPersonalOrganization };
}
