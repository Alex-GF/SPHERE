import container from '../config/container';
import PermissionService from '../services/PermissionService';
import { EntityType, EntityPermissions } from '../types/models/EntityPermission';
import { handleError } from '../utils/users/helpers';

class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = container.resolve('permissionService');
    this.getOrgPermissions = this.getOrgPermissions.bind(this);
    this.setPermission = this.setPermission.bind(this);
    this.removePermission = this.removePermission.bind(this);
    this.getUserPricings = this.getUserPricings.bind(this);
    this.getUserCollections = this.getUserCollections.bind(this);
    this.getPricingPermissions = this.getPricingPermissions.bind(this);
    this.getCollectionPermissions = this.getCollectionPermissions.bind(this);
  }

  async getOrgPermissions(req: any, res: any) {
    try {
      const entityType = req.query.entityType as EntityType | undefined;
      const permissions = await this.permissionService.getOrganizationPermissions(
        req.params.orgId,
        entityType
      );
      res.json(permissions);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async setPermission(req: any, res: any) {
    try {
      const { userId, entityType, entityId, permissions } = req.body;
      const result = await this.permissionService.setPermission(
        req.params.orgId,
        userId,
        entityType as EntityType,
        entityId,
        permissions as EntityPermissions,
        req.user.id,
        req.user.orgRole
      );
      res.status(201).json(result);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async removePermission(req: any, res: any) {
    try {
      const result = await this.permissionService.removePermission(
        req.params.permissionId,
        req.user.orgRole
      );
      if (!result) {
        res.status(404).send({ error: 'NOT FOUND: Permission not found' });
      } else {
        res.status(200).send({ message: 'Permission removed successfully' });
      }
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async getUserPricings(req: any, res: any) {
    try {
      const targetUserId = req.params.userId === 'me' ? req.user.id : req.params.userId;

      if (req.params.userId !== 'me' && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'PERMISSION ERROR: Only ADMIN users can query other users\' permissions',
        });
      }

      const queryParams = this._transformPricingQueryParams(req.query);
      const result = await this.permissionService.getUserAccessiblePricings(
        targetUserId,
        queryParams,
        req.user
      );
      res.json(result);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async getUserCollections(req: any, res: any) {
    try {
      const targetUserId = req.params.userId === 'me' ? req.user.id : req.params.userId;

      if (req.params.userId !== 'me' && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'PERMISSION ERROR: Only ADMIN users can query other users\' permissions',
        });
      }

      const queryParams = this._transformCollectionQueryParams(req.query);
      const result = await this.permissionService.getUserAccessibleCollections(
        targetUserId,
        queryParams,
        req.user
      );
      res.json(result);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async getPricingPermissions(req: any, res: any) {
    try {
      const result = await this.permissionService.getPricingPermissions(
        req.user.id,
        req.params.organizationId,
        req.params.pricingName,
        req.user.orgRole
      );
      res.json(result);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async getCollectionPermissions(req: any, res: any) {
    try {
      const result = await this.permissionService.getCollectionPermissions(
        req.user.id,
        req.params.organizationId,
        req.params.collectionSlug,
        req.user.orgRole
      );
      res.json(result);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  _transformPricingQueryParams(query: Record<string, string>) {
    return {
      name: query.name as string,
      sortBy: query.sortBy as any,
      sort: query.sort === 'asc' ? 'asc' as const : 'desc' as const,
      selectedOrganizations: query.selectedOrganizations
        ? (query.selectedOrganizations as string).split(',')
        : undefined,
      limit: parseInt(query.limit) || 10,
      offset: parseInt(query.offset) || 0,
      includePricingsInCollection: true,
    };
  }

  _transformCollectionQueryParams(query: Record<string, string>) {
    return {
      name: query.name as string,
      sortBy: query.sortBy as string,
      sort: query.sort ?? 'asc',
      organizationIds: query.organizationIds
        ? query.organizationIds.split(',')
        : undefined,
      limit: query.limit || '10',
      offset: query.offset || '0',
    };
  }
}

export default PermissionController;
