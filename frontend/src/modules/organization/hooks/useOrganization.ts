import { useContext, useEffect, useState } from 'react';
import { OrganizationContext } from '../contexts/organizationContext';
import { Organization, useOrganizationsApi } from '../api/organizationsApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useLocalStorage } from '../../core/hooks/useLocalStorage';

export const useOrganization = () => {
  return useContext(OrganizationContext);
};

export const useOrganizationManager = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authUser } = useAuth();
  const { getMyOrganizations } = useOrganizationsApi();
  const { getItem, setItem, removeItem } = useLocalStorage();

  const setActiveOrganization = (org: Organization) => {
    setActiveOrganizationState(org);
    setItem('activeOrgId', org.id);
  };

  useEffect(() => {
    if (!authUser.isAuthenticated || authUser.isLoading) {
      if (!authUser.isLoading) {
        setOrganizations([]);
        setActiveOrganizationState(null);
        setIsLoading(false);
        removeItem('activeOrgId');
      }
      return;
    }

    setIsLoading(true);
    getMyOrganizations()
      .then(orgs => {
        setOrganizations(orgs);
        const savedOrgId = getItem('activeOrgId');
        const savedOrg = savedOrgId ? orgs.find(o => o.id === savedOrgId) : null;
        const orgToUse = savedOrg ?? orgs.find(o => o.isPersonal) ?? orgs[0] ?? null;
        setActiveOrganizationState(orgToUse);
        if (orgToUse) {
          setItem('activeOrgId', orgToUse.id);
        }
      })
      .catch(() => {
        setOrganizations([]);
        setActiveOrganizationState(null);
      })
      .finally(() => setIsLoading(false));
  }, [authUser.isAuthenticated, authUser.isLoading]);

  return { organizations, activeOrganization, setActiveOrganization, isLoading };
};
