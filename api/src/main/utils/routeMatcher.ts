/**
 * Utility for matching URL paths with wildcard patterns
 * 
 * Supports two types of wildcards:
 * - '*' matches exactly one path segment
 * - '**' matches any number of path segments (must be at the end of the pattern)
 * 
 * Examples:
 * - Pattern '/users/*' matches '/users/john' but not '/users/john/profile'
 * - Pattern '/organizations/**' matches '/organizations/org1', '/organizations/org1/services', etc.
 * - Pattern '/api/v1/services/*\/contracts' matches '/api/v1/services/service1/contracts'
 */

/**
 * Normalizes a path by removing trailing slashes and ensuring it starts with '/'
 */
function normalizePath(path: string): string {
  // Remove trailing slash (except for root path)
  let normalized = path.endsWith('/') && path.length > 1 
    ? path.slice(0, -1) 
    : path;
  
  // Ensure it starts with '/'
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  return normalized;
}

/**
 * Checks if a given path matches a pattern with wildcards
 * 
 * @param pattern - The pattern to match against (can contain * and **)
 * @param path - The actual path to check
 * @returns true if the path matches the pattern, false otherwise
 */
export function matchPath(pattern: string, path: string): boolean {
  const normalizedPattern = normalizePath(pattern);
  const normalizedPath = normalizePath(path);

  // Check if pattern ends with '/**' (matches everything with that prefix)
  if (normalizedPattern.endsWith('/**')) {
    const prefix = normalizedPattern.slice(0, -3); // Remove '/**'
    return normalizedPath === prefix || normalizedPath.startsWith(prefix + '/');
  }

  // Split both pattern and path into segments
  const patternSegments = normalizedPattern.split('/').filter(s => s.length > 0);
  const pathSegments = normalizedPath.split('/').filter(s => s.length > 0);

  // If lengths don't match and there's no '**', they can't match
  if (patternSegments.length !== pathSegments.length) {
    return false;
  }

  // Compare each segment
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[i];

    // '*' matches any single segment
    if (patternSegment === '*') {
      continue;
    }

    // Exact match required
    if (patternSegment !== pathSegment) {
      return false;
    }
  }

  return true;
}

/**
 * Finds the first matching pattern from a list of patterns
 * 
 * @param patterns - Array of patterns to check
 * @param path - The path to match against
 * @returns The first matching pattern, or null if none match
 */
export function findMatchingPattern(patterns: string[], path: string): string | null {
  for (const pattern of patterns) {
    if (matchPath(pattern, path)) {
      return pattern;
    }
  }
  return null;
}

/**
 * Extracts the base API path from the full URL path
 * This removes the base URL prefix (e.g., '/api/v1') if present
 * 
 * @param fullPath - The full request path
 * @param baseUrlPath - The base URL path to remove (e.g., '/api/v1')
 * @returns The path without the base URL prefix
 */
export function extractApiPath(fullPath: string, baseUrlPath?: string): string {
  const normalized = normalizePath(fullPath);
  
  if (!baseUrlPath) {
    return normalized;
  }

  const normalizedBase = normalizePath(baseUrlPath);
  
  if (normalized.startsWith(normalizedBase)) {
    const remaining = normalized.slice(normalizedBase.length);
    return remaining || '/';
  }

  return normalized;
}
