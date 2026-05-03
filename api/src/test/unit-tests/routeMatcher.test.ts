/**
 * Unit tests for the route matcher utility
 * 
 * Run with: npm test or pnpm test
 */

import { describe, it, expect } from 'vitest';
import { matchPath, extractApiPath, findMatchingPattern } from '../../main/utils/routeMatcher';

describe('routeMatcher', () => {
  describe('matchPath', () => {
    it('should match exact paths', () => {
      expect(matchPath('/users', '/users')).toBe(true);
      expect(matchPath('/users/profile', '/users/profile')).toBe(true);
      expect(matchPath('/users', '/services')).toBe(false);
    });

    it('should handle trailing slashes', () => {
      expect(matchPath('/users/', '/users')).toBe(true);
      expect(matchPath('/users', '/users/')).toBe(true);
      expect(matchPath('/users/', '/users/')).toBe(true);
    });

    it('should handle paths without leading slash', () => {
      expect(matchPath('users', '/users')).toBe(true);
      expect(matchPath('/users', 'users')).toBe(true);
      expect(matchPath('users', 'users')).toBe(true);
    });

    it('should match single segment wildcard (*)', () => {
      expect(matchPath('/users/*', '/users/john')).toBe(true);
      expect(matchPath('/users/*', '/users/jane')).toBe(true);
      expect(matchPath('/users/*', '/users/john/profile')).toBe(false);
      expect(matchPath('/users/*/profile', '/users/john/profile')).toBe(true);
      expect(matchPath('/users/*/profile', '/users/john/settings')).toBe(false);
    });

    it('should match multi-segment wildcard (**)', () => {
      expect(matchPath('/users/**', '/users')).toBe(true);
      expect(matchPath('/users/**', '/users/john')).toBe(true);
      expect(matchPath('/users/**', '/users/john/profile')).toBe(true);
      expect(matchPath('/users/**', '/users/john/profile/settings')).toBe(true);
      expect(matchPath('/users/**', '/organizations/org1')).toBe(false);
    });

    it('should match organizations/** pattern', () => {
      expect(matchPath('/organizations/**', '/organizations')).toBe(true);
      expect(matchPath('/organizations/**', '/organizations/org1')).toBe(true);
      expect(matchPath('/organizations/**', '/organizations/org1/members')).toBe(true);
      expect(matchPath('/organizations/**', '/users/john')).toBe(false);
    });

    it('should match complex patterns', () => {
      expect(matchPath('/api/*/services', '/api/v1/services')).toBe(true);
      expect(matchPath('/api/*/services', '/api/v2/services')).toBe(true);
      expect(matchPath('/api/*/services', '/api/v1/users')).toBe(false);
    });
  });

  describe('extractApiPath', () => {
    it('should extract path without base URL', () => {
      expect(extractApiPath('/api/v1/users', '/api/v1')).toBe('/users');
      expect(extractApiPath('/api/v1/services/123', '/api/v1')).toBe('/services/123');
      expect(extractApiPath('/api/v1/', '/api/v1')).toBe('/');
    });

    it('should return path as-is when no base URL provided', () => {
      expect(extractApiPath('/users')).toBe('/users');
      expect(extractApiPath('/services/123')).toBe('/services/123');
    });

    it('should handle paths without leading slash', () => {
      expect(extractApiPath('api/v1/users', '/api/v1')).toBe('/users');
      expect(extractApiPath('/api/v1/users', 'api/v1')).toBe('/users');
    });
  });

  describe('findMatchingPattern', () => {
    const patterns = [
      '/users/**',
      '/services/*',
      '/organizations/*/members',
      '/analytics/**',
    ];

    it('should find the first matching pattern', () => {
      expect(findMatchingPattern(patterns, '/users/john')).toBe('/users/**');
      expect(findMatchingPattern(patterns, '/services/svc1')).toBe('/services/*');
      expect(findMatchingPattern(patterns, '/organizations/org1/members')).toBe('/organizations/*/members');
    });

    it('should return null when no pattern matches', () => {
      expect(findMatchingPattern(patterns, '/contracts/123')).toBe(null);
      expect(findMatchingPattern(patterns, '/features')).toBe(null);
    });
  });
});
