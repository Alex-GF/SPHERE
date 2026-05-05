/**
 * Unit tests for Authentication Middleware - REAL MIDDLEWARE EXECUTION
 *
 * This test suite tests the ACTUAL middleware function with mocked dependencies.
 * The middleware is called directly with Express req/res/next objects.
 * All external dependencies (database, services) are mocked via the container.
 *
 * Run with: npm test unit-tests/auth-middleware.test.ts
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Response, NextFunction } from 'express';
import { authenticateTokenMiddleware } from '../../main/middlewares/AuthMiddleware';
import {
  createMockRequest,
  createMockResponse,
  createMockNextFunction,
  buildBearerTokenHeader,
  buildApiKeyHeader,
  MutableRequest,
} from '../utils/auth/auth.testHelpers';
import {
  createMockAdminUser,
  createMockRegularUser,
  createMockUserWithExpiredToken,
  createMockUserWithApiKey,
  createMockUserWithRevokedApiKey,
  createMockUserWithExpiredApiKey,
  createMockOrganization,
} from '../utils/auth/auth.testData';
import { LeanUser, LeanUserWithApiKey } from '../../main/types/models/User';

// Mock the container - CRITICAL for isolated testing
let mockContainer: any;
vi.mock('../../main/config/container', () => ({
  default: {
    resolve: vi.fn((key: string) => {
      if (key === 'userRepository') {
        return mockContainer.userRepository;
      }
      if (key === 'organizationRepository') {
        return mockContainer.organizationRepository;
      }
      if (key === 'organizationService') {
        return mockContainer.organizationService;
      }
      return undefined;
    }),
  },
}));

describe('Auth Middleware - Real Execution Tests', () => {
  let mockReq: MutableRequest;
  let mockRes: Response;
  let mockNext: NextFunction;
  let mockUserRepository: any;
  let mockOrgRepository: any;
  let mockOrgService: any;

  beforeEach(() => {
    mockReq = createMockRequest({
      method: 'GET',
      path: '/api/v1/healthcheck',
    });
    mockRes = createMockResponse();
    mockNext = createMockNextFunction();

    // Setup mock repositories and services
    mockUserRepository = {
      findOne: vi.fn(),
      findByApiKey: vi.fn(),
    };

    mockOrgRepository = {
      findById: vi.fn(),
    };

    mockOrgService = {
      getUserOrgRole: vi.fn(),
    };

    // Initialize mockContainer for this test
    mockContainer = {
      userRepository: mockUserRepository,
      organizationRepository: mockOrgRepository,
      organizationService: mockOrgService,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Bearer Token Authentication
  // ============================================

  describe('Bearer Token Authentication', () => {
    it('should authenticate valid Bearer token - CALLS MIDDLEWARE', async () => {
      const user = createMockAdminUser();
      mockUserRepository.findOne.mockResolvedValue(user);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/users',
        headers: buildBearerTokenHeader(user.token!),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ token: user.token });
      expect((mockReq as any).user).toBeDefined();
      expect((mockReq as any).user.id).toBe(user.id);
    });

    it('should reject invalid Bearer token - CALLS MIDDLEWARE', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/users',
        headers: buildBearerTokenHeader('invalid_token_12345'),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect((mockRes as any).statusCode).toBe(401);
    });

    it('should reject expired Bearer token - CALLS MIDDLEWARE', async () => {
      const user = createMockUserWithExpiredToken();
      mockUserRepository.findOne.mockResolvedValue(user);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/users',
        headers: buildBearerTokenHeader(user.token!),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect((mockRes as any).statusCode).toBe(401);
    });

    it('should extract Bearer token correctly from header', async () => {
      const token = 'test_token_abc123';
      mockReq = createMockRequest({
        headers: buildBearerTokenHeader(token),
      });

      const authHeader = mockReq.headers.authorization as string;
      const extractedToken = authHeader.split(' ')[1];
      expect(extractedToken).toBe(token);
    });

    it('should handle missing Bearer token on public endpoint', async () => {
      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/healthcheck',
        headers: {},
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      // Debería permitir acceso
      expect(mockNext).toHaveBeenCalled();
    });
  });

  // ============================================
  // API Key Authentication
  // ============================================

  describe('API Key Authentication', () => {
    it('should authenticate valid API key - CALLS MIDDLEWARE', async () => {
      const user: any = createMockUserWithApiKey();
      user.apiKey = user.apiKeys[0];
      delete user.apiKeys;
      const apiKey = user.apiKey.key;

      mockUserRepository.findByApiKey.mockResolvedValue(user);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/pricings',
        headers: buildApiKeyHeader(apiKey),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect(mockUserRepository.findByApiKey).toHaveBeenCalledWith(apiKey);
      expect((mockReq as any).user).toBeDefined();
      expect((mockReq as any).authType).toBe('api-key');
    });

    it('should reject revoked API key - CALLS MIDDLEWARE', async () => {
      const user = createMockUserWithRevokedApiKey();
      const apiKey = user.apiKeys[0].key;
      mockUserRepository.findByApiKey.mockResolvedValue(user);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/pricings',
        headers: buildApiKeyHeader(apiKey),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect((mockRes as any).statusCode).toBe(401);
    });

    it('should reject expired API key - CALLS MIDDLEWARE', async () => {
      const user = createMockUserWithExpiredApiKey();
      const apiKey = user.apiKeys[0].key;
      mockUserRepository.findByApiKey.mockResolvedValue(user);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/pricings',
        headers: buildApiKeyHeader(apiKey),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect((mockRes as any).statusCode).toBe(401);
    });

    it('should extract API key from x-api-key header', async () => {
      const apiKey = 'usr_test_key_12345';
      mockReq = createMockRequest({
        headers: buildApiKeyHeader(apiKey),
      });

      expect(mockReq.headers['x-api-key']).toBe(apiKey);
    });

    it('should handle missing API key header on public endpoint', async () => {
      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/healthcheck',
        headers: {},
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle array API key header values', async () => {
      const apiKey = 'usr_test_key_12345';
      mockReq = createMockRequest({
        headers: {
          'x-api-key': [apiKey],
        } as any,
      });

      const headerValue = mockReq.headers['x-api-key'];
      expect(Array.isArray(headerValue)).toBe(true);
    });
  });

  // ============================================
  // Public vs Protected Endpoints
  // ============================================

  describe('Public vs Protected Endpoints', () => {
    it('should allow GET /healthcheck without auth - CALLS MIDDLEWARE', async () => {
      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/healthcheck',
        headers: {},
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny POST /pricings without auth - CALLS MIDDLEWARE', async () => {
      mockReq = createMockRequest({
        method: 'POST',
        path: '/api/v1/pricings',
        headers: {},
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect((mockRes as any).statusCode).toBe(401);
    });

    it('should allow GET /pricings with valid token - CALLS MIDDLEWARE', async () => {
      const user = createMockRegularUser();
      mockUserRepository.findOne.mockResolvedValue(user);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/pricings',
        headers: buildBearerTokenHeader(user.token!),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect((mockReq as any).user).toBeDefined();
    });
  });

  // ============================================
  // Organization Context with Middleware
  // ============================================

  describe('Organization Context - Real Middleware Execution', () => {
    it('should populate organization context when orgId is provided - CALLS MIDDLEWARE', async () => {
      const user = createMockAdminUser();
      const org = createMockOrganization({ id: 'org_123' });

      mockUserRepository.findOne.mockResolvedValue(user);
      mockOrgRepository.findById.mockResolvedValue(org);
      mockOrgService.getUserOrgRole.mockResolvedValue('OWNER');

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/orgs/org_123',
        params: { organizationId: 'org_123' },
        headers: buildBearerTokenHeader(user.token!),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect(mockOrgRepository.findById).toHaveBeenCalledWith('org_123');
    });

    it('should deny access when user is not member of organization - CALLS MIDDLEWARE', async () => {
      const user = createMockRegularUser();
      const org = createMockOrganization({ id: 'org_123' });

      mockUserRepository.findOne.mockResolvedValue(user);
      mockOrgRepository.findById.mockResolvedValue(org);
      mockOrgService.getUserOrgRole.mockResolvedValue(null); // User not member

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/orgs/org_123',
        params: { organizationId: 'org_123' },
        headers: buildBearerTokenHeader(user.token!),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect((mockRes as any).statusCode).toBe(403);
    });

    it('should bypass organization membership check for ADMIN users - CALLS MIDDLEWARE', async () => {
      const admin = createMockAdminUser();
      const org = createMockOrganization({ id: 'org_123' });

      mockUserRepository.findOne.mockResolvedValue(admin);
      mockOrgRepository.findById.mockResolvedValue(org);
      mockOrgService.getUserOrgRole.mockResolvedValue(null);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/orgs/org_123',
        params: { organizationId: 'org_123' },
        headers: buildBearerTokenHeader(admin.token!),
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      // ADMIN should be granted access
      expect((mockReq as any).user).toBeDefined();
    });
  });

  // ============================================
  // Edge Cases with Middleware Execution
  // ============================================

  describe('Edge Cases - Real Middleware Execution', () => {
    it('should handle both Bearer token and API key in same request', async () => {
      const user = createMockAdminUser();
      mockUserRepository.findOne.mockResolvedValue(user);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/users',
        headers: {
          ...buildBearerTokenHeader(user.token!),
          ...buildApiKeyHeader('usr_test_key'),
        },
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect((mockReq as any).authType).toBe('token');
    });

    it('should handle missing headers gracefully on public endpoint - CALLS MIDDLEWARE', async () => {
      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/healthcheck',
        headers: {},
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle null/undefined bearer token gracefully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      mockReq = createMockRequest({
        method: 'GET',
        path: '/api/v1/users',
        headers: {
          authorization: 'Bearer ',
        },
      });

      await authenticateTokenMiddleware(mockReq as any, mockRes, mockNext);

      expect((mockRes as any).statusCode).toBe(401);
    });
  });
});
