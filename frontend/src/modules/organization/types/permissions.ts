export type EntityType = 'pricing' | 'collection';
export type PermissionType = 'GET' | 'PUT' | 'DELETE';

export interface EntityPermissions {
  GET: boolean;
  PUT: boolean;
  DELETE: boolean;
}

export interface EntityPermission {
  id: string;
  _userId: string;
  _organizationId: string;
  entityType: EntityType;
  entityId: string;
  permissions: EntityPermissions;
  grantedBy?: string;
  entityName?: string;
  userName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetPermissionPayload {
  userId: string;
  entityType: EntityType;
  entityId: string;
  permissions: EntityPermissions;
}
