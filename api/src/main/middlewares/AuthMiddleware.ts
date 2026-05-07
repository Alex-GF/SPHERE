import { Request, Response, NextFunction } from 'express';
import container from '../config/container';
import { HttpMethod } from '../types/permissions';
import { extractApiPath, matchPath } from '../utils/routeMatcher';
import { DEFAULT_PERMISSION_DENIED_MESSAGE, ROUTE_PERMISSIONS } from '../config/permissions';
import UserRepository from '../repositories/mongoose/UserRepository';
import { handleError } from '../utils/users/helpers';
import { ApiKey } from '../types/models/User';
import { ROLE_WEIGHT } from '../types/models/Organization';

/**
 * Middleware to authenticate API Keys (both User and Organization types)
 *
 * Supports two types of API Keys:
 * 1. User API Keys (prefix: "usr_") - Authenticates a specific user
 * 2. Organization API Keys (prefix: "org_") - Authenticates at organization level
 *
 * Sets req.user for User API Keys
 * Sets req.org for Organization API Keys
 */
const authenticateTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string = req.headers.authorization || '';
  const apiKeyHeader: string = Array.isArray(req.headers['x-api-key'])
    ? req.headers['x-api-key'][0]
    : req.headers['x-api-key'] || ('' as string);

  try {
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
    const apiKey = apiKeyHeader;

    if (token && token !== "null") {
      await authenticateToken(req, token);
    } else if (apiKey) {
      await authenticateApiKey(req, apiKey);
    }

    return checkPermissions(req, res, next);
  } catch (err: any) {
    if (!res.headersSent) {
      const { status, message } = handleError(err);
      return res.status(status).json({ error: message });
    }
  }
};

async function authenticateApiKey(req: Request, apiKey: string): Promise<void> {
  const userRepository: UserRepository = container.resolve('userRepository');
  const user = await userRepository.findByApiKey(apiKey);

  if (!user) {
    throw new Error('UNAUTHORIZED: Invalid API Key. Maybe the key is invalid, revoked, or expired');
  }

  if (!user.apiKey || user.apiKey.revoked) {
    throw new Error('UNAUTHORIZED: API Key revoked');
  }

  if (user.apiKey.expiresAt && new Date() > new Date(user.apiKey.expiresAt)) {
    throw new Error('UNAUTHORIZED: API Key expired');
  }

  (req as any).user = user;
  (req as any).authType = 'api-key';
}

/**
 * Authenticates a User API Key and populates req.user
 */
async function authenticateToken(req: Request, token: string): Promise<void> {
  const userRepository: UserRepository = container.resolve('userRepository');

  const user = await userRepository.findOne({ token: token });

  if (!user) {
    throw new Error('UNAUTHORIZED: Invalid User Token');
  }

  if (user.tokenExpiration && new Date() > new Date(user.tokenExpiration)) {
    throw new Error('UNAUTHORIZED: User Token has expired');
  }

  (req as any).user = user;
  (req as any).authType = 'token';
}

async function populateOrganizationContext(req: Request): Promise<void> {
  const organizationId = req.params.organizationId || extractOrganizationIdFromPath(req.path);

  if (organizationId && !req.params.organizationId) {
    req.params.organizationId = organizationId;
  }

  if (organizationId) {
    const organizationRepository = container.resolve('organizationRepository');
    const organizationService = container.resolve('organizationService');

    const organization = await organizationRepository.findById(organizationId);

    if (organization) {
      (req as any).org = organization;

      const role = await organizationService.getUserOrgRole((req as any).user.id, organizationId);

      // Global ADMIN bypasses organization membership checks.
      if (!role && (req as any).user.role !== 'ADMIN') {
        throw new Error('PERMISSION ERROR: You do not belong to this organization');
      }

      if ((req as any).authType === 'api-key' && (req as any).user.apiKey) {
        const scope = _resolveApiKeyScope(
          (req as any).user.apiKey,
          organizationId,
          organization.ancestors
        );

        if (!scope) {
          throw new Error('PERMISSION ERROR: API Key does not have access to this organization');
        }

        (req as any).user.orgRole = _intersectRoleWithScope(role, scope);
      } else {
        (req as any).user.orgRole = (req as any).user.role === 'ADMIN' ? 'OWNER' : role;
      }
    } else {
      throw new Error('NOT FOUND: Organization not found');
    }
  }
}

function extractOrganizationIdFromPath(path: string): string | undefined {
  const segments = path
    .replace('/api/v1' + (process.env.BASE_URL_PATH ?? ''), '')
    .split('/')
    .filter(Boolean);

  if (segments[0] !== 'orgs' && segments[0] !== 'pricings' && segments[0] !== 'collections') {
    return undefined;
  }

  const organizationId = segments[1];
  if (!organizationId || organizationId === 'invitations' || organizationId === 'join') {
    return undefined;
  }

  return organizationId;
}

/**
 * Middleware to verify permissions based on route configuration
 *
 * Checks if the authenticated entity (user or organization) has permission
 * to access the requested route with the specified HTTP method.
 *
 * Must be used AFTER authenticateApiKey middleware.
 */
const checkPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const method = req.method.toUpperCase() as HttpMethod;
    const baseUrlPath = (process.env.BASE_URL_PATH ?? '') + '/api/v1';
    const apiPath = extractApiPath(req.path, baseUrlPath);

    // Find matching permission rule
    const matchingRule = ROUTE_PERMISSIONS.find(rule => {
      const methodMatches = rule.methods.includes(method);
      const pathMatches = matchPath(rule.path, apiPath);
      return methodMatches && pathMatches;
    });

    // If no rule matches, deny by default
    if (!matchingRule) {
      return res.status(403).json({
        error: DEFAULT_PERMISSION_DENIED_MESSAGE,
        details: `No permission rule found for ${method} ${apiPath}`,
      });
    }

    // Allow public routes without authentication
    if (matchingRule.isPublic) {
      return next();
    }

    // Protected route - require authentication
    if (!(req as any).user) {
      return res.status(401).json({
        error:
          'INVALID DATA: Token not found. Please ensure to add a token as value of the "Authorization" header, using `Bearer {token}` format.',
      });
    }

    await populateOrganizationContext(req);

    // Verify permissions based on auth type
    if (
      !matchingRule.allowedUserRoles ||
      !matchingRule.allowedUserRoles.includes((req as any).user.role)
    ) {
      return res.status(403).json({
        error: `PERMISSION ERROR: Your user role (${(req as any).user.role}) does not have permission to ${method} ${apiPath}`,
      });
    }

    // Optional organization role check, centralized here.
    if (matchingRule.allowedOrganizationRoles?.length) {
      const user = (req as any).user;
      const org = (req as any).org;
      const organizationId = req.params.organizationId || extractOrganizationIdFromPath(apiPath);

      if (organizationId && !req.params.organizationId) {
        req.params.organizationId = organizationId;
      }

      if (!org) {
        return res.status(400).json({
          error:
            'INVALID DATA: Organization context is required and it could not be resolved. Please provide a valid organization ID as query param',
        });
      }

      if (!user.orgRole) {
        return res
          .status(403)
          .json({ error: 'PERMISSION ERROR: You do not belong to this organization' });
      }

      if (!matchingRule.allowedOrganizationRoles.includes(user.orgRole)) {
        return res
          .status(403)
          .json({
            error:
              "PERMISSION ERROR: Insufficient role for this action. If you're sure that you have the required role to perform this actions, you may be using an API key with limited permissions",
          });
      }
    }

    // Permission granted
    next();
  } catch (error) {
    const { status, message } = handleError(error);
    if (!res.headersSent) {
      res.status(status).json({ error: message });
    }
  }
};

function _resolveApiKeyScope(
  apiKey: ApiKey,
  orgId: string,
  ancestors: string[]
): string | undefined {
  const resolvedScope = apiKey.scopes.find((s: any) => {
    if (s.scope === 'ALL') {
      return [orgId, ...ancestors].includes(String(s.organizationId));
    }

    return String(s.organizationId) === orgId;
  });

  return resolvedScope?.scope;
}

function _intersectRoleWithScope(
  orgRole: 'OWNER' | 'ADMIN' | 'MEMBER',
  apiKeyScope: string
): 'OWNER' | 'ADMIN' | 'MEMBER' {
  if (apiKeyScope === 'VIEW') {
    return 'MEMBER';
  }

  if (apiKeyScope === 'MANAGEMENT') {
    return ROLE_WEIGHT[orgRole] >= ROLE_WEIGHT.ADMIN ? 'ADMIN' : orgRole;
  }

  return orgRole; // ALL
}

export { authenticateTokenMiddleware };
