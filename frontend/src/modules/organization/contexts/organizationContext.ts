import { createContext } from 'react';
import { Organization } from '../api/organizationsApi';

export interface OrganizationContextInterface {
  organizations: Organization[];
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextInterface>({
  organizations: [],
  isLoading: true,
});

export default OrganizationContext;
