/**
 * Permission configuration for API routes
 * 
 * This file defines access control rules for both User API Keys and Organization API Keys.
 * 
 * Pattern matching:
 * - '*' matches any single path segment
 * - '**' matches any number of path segments (must be at the end)
 * 
 * Examples:
 * - '/users/*' matches '/users/john' but not '/users/john/profile'
 * - '/organizations/**' matches '/organizations/org1', '/organizations/org1/services', etc.
 */

import { RoutePermission } from "../types/permissions";

/**
 * Route permission configuration
 * 
 * Rules are evaluated in order. The first matching rule determines access.
 * If no rule matches, access is denied by default.
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // ============================================
  // User Management Routes (User API Keys ONLY)
  // ============================================
  {
    path: '/users/login',
    methods: ['POST'],
    isPublic: true,
  },
  {
    path: '/users/register',
    methods: ['POST'],
    isPublic: true,
  },
  {
    path: '/users/*/updateToken',
    methods: ['PUT'],
    allowedUserRoles: ['ADMIN'],
  },
  {
    path: '/users/**',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedUserRoles: ['ADMIN', 'USER'],
  },

  // ============================================
  // Health Check (Public)
  // ============================================
  {
    path: '/healthcheck',
    methods: ['GET'],
    isPublic: true, // No authentication required
  },
];

/**
 * Default denial message when no permission is granted
 */
export const DEFAULT_PERMISSION_DENIED_MESSAGE = 'You do not have permission to access this resource';
