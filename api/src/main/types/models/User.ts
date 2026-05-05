import { UserRole } from '../config/permissions';

export interface LeanUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  token?: string;
  tokenExpiration?: Date;
  apiKeys: {
    key: string;
    name: string;
    scopes: {
      organizationId: string;
      scope: 'ALL' | 'MANAGEMENT' | 'VIEW';
    }[];
    expiresAt?: Date;
    revoked: boolean;
  }[];
}

export type UserFilters = {
  username?: string;
  email?: string;
  role?: UserRole;
};

export type ApiKey = {
  key: string;
  revoked: boolean;
  expiresAt: Date | null;
  scopes: { organizationId: string; scope: 'ALL' | 'MANAGEMENT' | 'VIEW' }[];
};
