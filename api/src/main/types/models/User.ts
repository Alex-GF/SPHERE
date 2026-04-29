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
  phone?: string;
  address?: string;
  postalCode?: string;
  token?: string;
  tokenExpiration?: Date;
}

export type UserFilters = {
  username?: string;
  email?: string;
  role?: UserRole;
}