export type EntityType = 'pricing' | 'collection';
export type PermissionType = 'GET' | 'PUT' | 'DELETE';

export interface EntityPermissions {
  GET: boolean;
  PUT: boolean;
  DELETE: boolean;
}

export interface LeanEntityPermission {
  id: string;
  _userId: string;
  _organizationId: string;
  entityType: EntityType;
  entityId: string;
  permissions: EntityPermissions;
  grantedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
