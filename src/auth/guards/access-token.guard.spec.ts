import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenGuard } from './access-token.guard';

describe('AccessTokenGuard', () => {
  let accessTokengGuard: AccessTokenGuard;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const createMockExecutionContext = (
    headers: Record<string, string>,
  ): ExecutionContext => {
    const mockRequest = {
      headers,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    accessTokengGuard = module.get<AccessTokenGuard>(AccessTokenGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(accessTokengGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true and attach user to request for a valid token', async () => {
      const userPayload = { sub: 'random-uuid', email: 'test@example.com' };
      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
        user: undefined,
      };
      const mockContext = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
      } as unknown as ExecutionContext;

      mockJwtService.verifyAsync.mockResolvedValue(userPayload);

      const canActivate = await accessTokengGuard.canActivate(mockContext);

      expect(canActivate).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(userPayload);
    });

    it('should throw UnauthorizedException if authorization header is missing', async () => {
      const mockContext = createMockExecutionContext({});

      await expect(accessTokengGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for malformed header: invalid-token-format', async () => {
      const headerValue = 'invalid-token-format';
      const mockContext = createMockExecutionContext({
        authorization: headerValue,
      });

      await expect(accessTokengGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    const mockContext = createMockExecutionContext({
      authorization: 'Bearer invalid-token',
    });

    mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(accessTokengGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
