import { createContext } from 'react';
import { Organization } from '../api/organizationsApi';

export interface OrganizationContextInterface {
  organizations: Organization[];
  activeOrganization: Organization | null;
  setActiveOrganization: (org: Organization) => void;
  isLoading: boolean;
}

export const OrganizationContext = createContext<OrganizationContextInterface>({
  organizations: [],
  activeOrganization: null,
  setActiveOrganization: () => {},
  isLoading: true,
});
