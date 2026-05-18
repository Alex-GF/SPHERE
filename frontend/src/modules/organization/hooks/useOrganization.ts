import { useContext, useEffect, useState } from 'react';
import OrganizationContext from '../contexts/organizationContext';
import { Organization, useOrganizationsApi } from '../api/organizationsApi';
import { useAuth } from '../../auth/hooks/useAuth';

export const useOrganization = () => {
  return useContext(OrganizationContext);
};

export const useOrganizationManager = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authUser } = useAuth();
  const { getMyOrganizations } = useOrganizationsApi();

  useEffect(() => {
    if (!authUser.isAuthenticated || authUser.isLoading) {
      if (!authUser.isLoading) {
        setOrganizations([]);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    getMyOrganizations()
      .then(orgs => {
        setOrganizations(orgs);
      })
      .catch(() => {
        setOrganizations([]);
      })
      .finally(() => setIsLoading(false));
  }, [authUser.isAuthenticated, authUser.isLoading]);

  return { organizations, isLoading };
};
