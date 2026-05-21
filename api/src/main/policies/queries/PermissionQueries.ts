import container from '../../config/container';
import EntityPermissionRepository from '../../repositories/mongoose/EntityPermissionRepository';
import OrganizationMembershipRepository from '../../repositories/mongoose/OrganizationMembershipRepository';
import { EntityPermissions } from '../../types/models/EntityPermission';
import { OrgRole } from '../../types/models/Organization';
import { BatchEvaluationContext } from '../../types/policies';

const FULL_PERMISSIONS: EntityPermissions = {
  GET: true,
  PUT: true,
  DELETE: true,
  CREATE: true,
};

const NO_PERMISSIONS: EntityPermissions = {
  GET: false,
  PUT: false,
  DELETE: false,
  CREATE: false,
};

/**
 * PermissionQueries - Batch database lookups for permission evaluation.
 *
 * Eliminates N+1 query patterns by fetching all required permissions
 * in a minimal number of queries.
 *
 * Usage:
 *   const queries = new PermissionQueries();
 *   const batchCtx = await queries.buildBatchContext('user1', 'org1');
 *   const results = engine.evaluateBatch(contexts, { batchContext: batchCtx });
 */
export class PermissionQueries {
  private entityPermissionRepository: EntityPermissionRepository;
  private organizationMembershipRepository: OrganizationMembershipRepository;

  constructor() {
    this.entityPermissionRepository = container.resolve('entityPermissionRepository');
    this.organizationMembershipRepository = container.resolve('organizationMembershipRepository');
  }

  /**
   * Build a batch evaluation context for a user in an organization.
   * Fetches all permissions in minimal DB queries.
   *
   * @returns BatchEvaluationContext with pre-fetched data
   */
  async buildBatchContext(
    userId: string,
    organizationId: string,
    userOrgRole?: OrgRole | null,
    isGlobalAdmin?: boolean
  ): Promise<BatchEvaluationContext> {
    // Fetch org-scoped permissions (for CREATE checks)
    const orgScopedPermissions = await this.fetchOrgScopedPermissions(userId, organizationId);

    // Fetch all entity-level permissions for this user in this org
    const entityPermissions = await this.fetchEntityPermissions(userId, organizationId);

    // Fetch collection permissions (for pricing inheritance)
    const collectionPermissions = await this.fetchCollectionPermissions(entityPermissions);

    return {
      userId,
      organizationId,
      userOrgRole,
      isGlobalAdmin,
      orgPermissions: orgScopedPermissions,
      entityPermissions,
      collectionPermissions,
    };
  }

  /**
   * Fetch org-scoped permissions (entityId = null) for CREATE checks.
   */
  private async fetchOrgScopedPermissions(
    userId: string,
    organizationId: string
  ): Promise<Map<string, EntityPermissions>> {
    const permissions = new Map<string, EntityPermissions>();

    const orgPricingPerm = await this.entityPermissionRepository.findByUserAndOrgScopedType(
      userId,
      organizationId,
      'pricing'
    );
    if (orgPricingPerm) {
      permissions.set('pricing', orgPricingPerm.permissions);
    }

    const orgCollectionPerm = await this.entityPermissionRepository.findByUserAndOrgScopedType(
      userId,
      organizationId,
      'collection'
    );
    if (orgCollectionPerm) {
      permissions.set('collection', orgCollectionPerm.permissions);
    }

    return permissions;
  }

  /**
   * Fetch all entity-level permissions for a user in an organization.
   * Returns a Map keyed by "entityType:entityId".
   */
  private async fetchEntityPermissions(
    userId: string,
    organizationId: string
  ): Promise<Map<string, EntityPermissions>> {
    const permissions = new Map<string, EntityPermissions>();

    const entityPerms = await this.entityPermissionRepository.findByUserAndOrganization(
      userId,
      organizationId
    );

    for (const perm of entityPerms) {
      if (perm.entityId) {
        const key = `${perm.entityType}:${perm.entityId}`;
        permissions.set(key, perm.permissions);
      }
    }

    return permissions;
  }

  /**
   * Extract collection permissions from entity permissions.
   * Used for pricing inheritance (pricing inside collection).
   */
  private async fetchCollectionPermissions(
    entityPermissions: Map<string, EntityPermissions>
  ): Promise<Map<string, EntityPermissions>> {
    const collectionPermissions = new Map<string, EntityPermissions>();

    for (const [key, perms] of entityPermissions) {
      if (key.startsWith('collection:')) {
        const collectionId = key.replace('collection:', '');
        collectionPermissions.set(collectionId, perms);
      }
    }

    return collectionPermissions;
  }

  /**
   * Resolve organization role for a user.
   * Handles hierarchical org membership (parent org roles).
   */
  async resolveOrgRole(
    userId: string,
    organizationId: string
  ): Promise<OrgRole | null> {
    const role = await this.organizationMembershipRepository.findUserRoleInOrganization(
      userId,
      organizationId
    );
    return role as OrgRole | null;
  }
}
