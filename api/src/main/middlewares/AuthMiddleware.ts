
import { Request, Response, NextFunction } from 'express';
import container from '../config/container';
import { HttpMethod } from '../types/permissions';
import { extractApiPath, matchPath } from '../utils/routeMatcher';
import { DEFAULT_PERMISSION_DENIED_MESSAGE, ROUTE_PERMISSIONS } from '../config/permissions';
import UserRepository from '../repositories/mongoose/UserRepository';

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
  const authHeader: string = req.headers.authorization || "";

  try {
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
    if (!token) {
      return checkPermissions(req, res, next);
    } else {
      await authenticateToken(req, token);
    }

    return checkPermissions(req, res, next);
  } catch (err: any) {
    if (!res.headersSent) {
      return res.status(401).json({
        error: err.message || 'Invalid API Key',
      });
    }
  }
};

/**
 * Authenticates a User API Key and populates req.user
 */
async function authenticateToken(req: Request, token: string): Promise<void> {
  const userRepository: UserRepository = container.resolve('userRepository');

  const user = await userRepository.findOne({ token: token });

  if (!user) {
    throw new Error('Invalid User Token');
  }

  (req as any).user = user;
}

/**
 * Middleware to verify permissions based on route configuration
 *
 * Checks if the authenticated entity (user or organization) has permission
 * to access the requested route with the specified HTTP method.
 *
 * Must be used AFTER authenticateApiKey middleware.
 */
const checkPermissions = (req: Request, res: Response, next: NextFunction) => {
  try {
    const method = req.method.toUpperCase() as HttpMethod;
    const baseUrlPath = (process.env.BASE_URL_PATH ?? "") + '/api/v1';
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
          'Token not found. Please ensure to add a token as value of the "Authorization" header, using `Bearer {token}` format.',
      });
    }

    // Verify permissions based on auth type
    if ((req as any).user) {
      if (
        !matchingRule.allowedUserRoles ||
        !matchingRule.allowedUserRoles.includes((req as any).user.role)
      ) {
        return res.status(403).json({
          error: `Your user role (${(req as any).user.role}) does not have permission to ${method} ${apiPath}`,
        });
      }
    } else {
      // No valid authentication found
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    // Permission granted
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal error while verifying permissions',
    });
  }
};

export { authenticateTokenMiddleware };
