import container from '../config/container';
import EntityPermissionRepository from '../repositories/mongoose/EntityPermissionRepository';
import OrganizationMembershipRepository from '../repositories/mongoose/OrganizationMembershipRepository';
import PricingRepository from '../repositories/mongoose/PricingRepository';
import PricingCollectionRepository from '../repositories/mongoose/PricingCollectionRepository';
import { EntityType, EntityPermissions, LeanEntityPermission, PermissionType } from '../types/models/EntityPermission';
import { OrgRole } from '../types/models/Organization';
import { LeanUser } from '../types/models/User';
import { PricingIndexQueryParams } from '../types/services/PricingService';
import { CollectionIndexQueryParams } from '../types/services/PricingCollection';

const FULL_PERMISSIONS: EntityPermissions = { GET: true, PUT: true, DELETE: true, CREATE: true };
const NO_PERMISSIONS: EntityPermissions = { GET: false, PUT: false, DELETE: false, CREATE: false };

class PermissionService {
  private entityPermissionRepository: EntityPermissionRepository;
  private organizationMembershipRepository: OrganizationMembershipRepository;
  private pricingRepository: PricingRepository;
  private pricingCollectionRepository: PricingCollectionRepository;

  constructor() {
    this.entityPermissionRepository = container.resolve('entityPermissionRepository');
    this.organizationMembershipRepository = container.resolve('organizationMembershipRepository');
    this.pricingRepository = container.resolve('pricingRepository');
    this.pricingCollectionRepository = container.resolve('pricingCollectionRepository');
  }

  /**
   * Returns effective permissions for a user on an entity.
   * OWNER/ADMIN always get full permissions.
   * For MEMBERs, looks up EntityPermission records.
   */
  private async getEffectivePermissions(
    userId: string,
    organizationId: string,
    entityType: EntityType,
    entityId: string,
    userOrgRole?: OrgRole | null
  ): Promise<EntityPermissions> {
    if (userOrgRole === 'OWNER' || userOrgRole === 'ADMIN') {
      return { ...FULL_PERMISSIONS };
    }

    const permission = await this.entityPermissionRepository.findByUserEntityAndOrganization(
      userId,
      organizationId,
      entityType,
      entityId
    );

    if (!permission) {
      return { ...NO_PERMISSIONS };
    }

    return { ...permission.permissions };
  }

  /**
   * Checks if a user has a specific permission on an entity.
   */
  async hasPermission(
    userId: string,
    organizationId: string,
    entityType: EntityType,
    entityId: string,
    permission: PermissionType,
    userOrgRole?: OrgRole | null
  ): Promise<boolean> {
    if (userOrgRole === 'OWNER' || userOrgRole === 'ADMIN') {
      return true;
    }

    const perms = await this.getEffectivePermissions(userId, organizationId, entityType, entityId, userOrgRole);
    return perms[permission] === true;
  }

  /**
   * Sets permissions for a user on an entity. Only OWNER/ADMIN can call this.
   * When entityId is null, sets org-scoped permissions (e.g., CREATE).
   */
  async setPermission(
    organizationId: string,
    userId: string,
    entityType: EntityType,
    entityId: string | null,
    permissions: EntityPermissions,
    grantedBy: string,
    granterOrgRole: OrgRole
  ): Promise<LeanEntityPermission> {
    if (granterOrgRole !== 'OWNER' && granterOrgRole !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: Only OWNER and ADMIN users can manage entity permissions');
    }

    const result = await this.entityPermissionRepository.findOrCreate(
      userId,
      organizationId,
      entityType,
      entityId,
      permissions,
      grantedBy
    );

    return result;
  }

  /**
   * Removes a permission by ID. Only OWNER/ADMIN can call this.
   */
  async removePermission(permissionId: string, granterOrgRole: OrgRole): Promise<boolean> {
    if (granterOrgRole !== 'OWNER' && granterOrgRole !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: Only OWNER and ADMIN users can manage entity permissions');
    }

    return this.entityPermissionRepository.destroy(permissionId);
  }

  /**
   * Gets all entity permissions for an organization.
   */
  async getOrganizationPermissions(
    organizationId: string,
    entityType?: EntityType
  ): Promise<LeanEntityPermission[]> {
    return this.entityPermissionRepository.findByOrganization(organizationId, entityType);
  }

  /**
   * Gets all pricings accessible to a user across all their organizations,
   * with effective permissions included.
   */
  async getUserAccessiblePricings(
    userId: string,
    queryParams: PricingIndexQueryParams,
    reqUser?: LeanUser
  ): Promise<{ pricings: any[]; total: number }> {
    const memberships = await this.organizationMembershipRepository.findByUserId(userId, true);
    const orgIds = memberships.map((m: any) => m._organizationId?.toString() ?? m._organizationId);

    if (orgIds.length === 0) {
      return { pricings: [], total: 0 };
    }

    const allPricings: any[] = [];

    for (const orgId of orgIds) {
      const membership = memberships.find((m: any) => (m._organizationId?.toString() ?? m._organizationId) === orgId);
      const orgRole = membership?.role as OrgRole | undefined;
      const isOwnerOrAdmin = reqUser?.role === 'ADMIN' || orgRole === 'OWNER' || orgRole === 'ADMIN';

      const orgQueryParams: PricingIndexQueryParams = {
        ...queryParams,
        selectedOrganizations: [orgId],
        includePricingsInCollection: true,
      };

      const result = await this.pricingRepository.findAll(orgQueryParams, true);

      if (result && result.pricings) {
        for (const pricing of result.pricings) {
          const entityId = pricing._id?.toString() ?? pricing.id;
          const permissions = await this.getEffectivePermissions(
            userId,
            orgId,
            'pricing',
            entityId,
            orgRole
          );

          if (isOwnerOrAdmin || !pricing.private || permissions.GET) {
            allPricings.push({
              ...pricing,
              permissions,
              organization: { ...pricing.organization, id: orgId, role: orgRole },
            });
          }
        }
      }
    }

    if (queryParams.name) {
      const nameFilter = queryParams.name.toLowerCase();
      const filtered = allPricings.filter((p: any) => p.name?.toLowerCase().includes(nameFilter));
      return { pricings: filtered, total: filtered.length };
    }

    const sortBy = queryParams.sortBy || 'name';
    const sortDir = queryParams.sort === 'asc' ? 1 : -1;
    allPricings.sort((a: any, b: any) => {
      const aVal = a[sortBy] ?? a.name ?? '';
      const bVal = b[sortBy] ?? b.name ?? '';
      if (typeof aVal === 'string') return aVal.localeCompare(bVal) * sortDir;
      return ((aVal as number) - (bVal as number)) * sortDir;
    });

    const offset = queryParams.offset || 0;
    const limit = queryParams.limit || 10;
    const paginated = allPricings.slice(offset, offset + limit);

    return { pricings: paginated, total: allPricings.length };
  }

  /**
   * Gets all collections accessible to a user across all their organizations,
   * with effective permissions included.
   */
  async getUserAccessibleCollections(
    userId: string,
    queryParams: CollectionIndexQueryParams,
    reqUser?: LeanUser
  ): Promise<{ collections: any[]; total: number }> {
    const memberships = await this.organizationMembershipRepository.findByUserId(userId, true);
    const orgIds = memberships.map((m: any) => m._organizationId?.toString() ?? m._organizationId);

    if (orgIds.length === 0) {
      return { collections: [], total: 0 };
    }

    const allCollections: any[] = [];

    for (const orgId of orgIds) {
      const membership = memberships.find((m: any) => (m._organizationId?.toString() ?? m._organizationId) === orgId);
      const orgRole = membership?.role as OrgRole | undefined;
      const isOwnerOrAdmin = reqUser?.role === 'ADMIN' || orgRole === 'OWNER' || orgRole === 'ADMIN';

      const orgQueryParams: CollectionIndexQueryParams = {
        ...queryParams,
        organizationIds: [orgId],
      };

      const result = await this.pricingCollectionRepository.findAll(orgQueryParams, true);

      if (result && result.collections) {
        for (const collection of result.collections) {
          const entityId = (collection as any)._id?.toString() ?? (collection as any).id;
          const permissions = await this.getEffectivePermissions(
            userId,
            orgId,
            'collection',
            entityId,
            orgRole
          );

          if (isOwnerOrAdmin || !(collection as any).private || permissions.GET) {
            allCollections.push({
              ...collection,
              permissions,
              organization: { ...(collection as any).organization, id: orgId, role: orgRole },
            });
          }
        }
      }
    }

    if (queryParams.name) {
      const nameFilter = queryParams.name.toLowerCase();
      const filtered = allCollections.filter((c: any) => c.name?.toLowerCase().includes(nameFilter));
      return { collections: filtered, total: filtered.length };
    }

    allCollections.sort((a: any, b: any) => {
      const aVal = a.name ?? '';
      const bVal = b.name ?? '';
      return aVal.localeCompare(bVal);
    });

    const offset = parseInt(queryParams.offset as string) || 0;
    const limit = parseInt(queryParams.limit as string) || 10;
    const paginated = allCollections.slice(offset, offset + limit);

    return { collections: paginated, total: allCollections.length };
  }

  /**
   * Gets effective permissions for the current user on a specific pricing.
   */
  async getPricingPermissions(
    userId: string,
    organizationId: string,
    pricingName: string,
    userOrgRole?: OrgRole | null
  ): Promise<EntityPermissions> {
    const pricing = await this.pricingRepository.findOne(pricingName, organizationId, { includePrivate: true });
    if (!pricing || !pricing.versions || pricing.versions.length === 0) {
      throw new Error('NOT FOUND: Pricing not found');
    }

    const entityId = pricing.versions[0].id;
    const isOwnerOrAdmin = userOrgRole === 'OWNER' || userOrgRole === 'ADMIN';
    if (isOwnerOrAdmin) {
      return { ...FULL_PERMISSIONS };
    }
    const permissions = await this.getEffectivePermissions(
      userId,
      organizationId,
      'pricing',
      entityId,
      userOrgRole
    );

    return permissions;
  }

  /**
   * Gets effective permissions for the current user on a specific collection.
   */
  async getCollectionPermissions(
    userId: string,
    organizationId: string,
    collectionSlug: string,
    userOrgRole?: OrgRole | null
  ): Promise<EntityPermissions> {
    const collection = await this.pricingCollectionRepository.findByOrganizationAndSlug(
      organizationId,
      collectionSlug
    );
    if (!collection) {
      throw new Error('NOT FOUND: Collection not found');
    }

    const entityId = collection.id;
    const isOwnerOrAdmin = userOrgRole === 'OWNER' || userOrgRole === 'ADMIN';
    if (isOwnerOrAdmin) {
      return { ...FULL_PERMISSIONS };
    }
    const permissions = await this.getEffectivePermissions(
      userId,
      organizationId,
      'collection',
      entityId,
      userOrgRole
    );

    return permissions;
  }
}

export default PermissionService;
