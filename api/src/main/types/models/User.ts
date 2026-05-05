import { UserRole } from "../config/permissions";

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
    permissions: {
      _organizationId?: string;
      _groupId?: string;
      role: 'owner' | 'admin' | 'member';
    }[];
  }[];
}

export type UserFilters = {
  username?: string;
  email?: string;
  role?: UserRole;
}