import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenGuard } from './refresh-token.guard';

describe('RefreshTokenGuard', () => {
  let refreshTokenGuard: RefreshTokenGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const createMockExecutionContext = (
    cookies: Record<string, string>,
  ): ExecutionContext => {
    const mockRequest = {
      cookies,
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
        RefreshTokenGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    refreshTokenGuard = module.get<RefreshTokenGuard>(RefreshTokenGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(refreshTokenGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true and attach user to request for a valid token', async () => {
      const userPayload = { sub: 'random-uuid', email: 'test@example.com' };
      const token = 'valid-refresh-token';
      const mockRequest = {
        cookies: { refresh_token: token },
        user: undefined,
      };
      const mockContext = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
      } as unknown as ExecutionContext;

      mockJwtService.verifyAsync.mockResolvedValue(userPayload);

      const canActivate = await refreshTokenGuard.canActivate(mockContext);

      expect(canActivate).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(mockRequest.user).toEqual(userPayload);
    });

    it('should throw UnauthorizedException if refresh_token cookie is missing', async () => {
      const mockContext = createMockExecutionContext({});

      await expect(refreshTokenGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      const mockContext = createMockExecutionContext({
        refresh_token: 'invalid-token',
      });

      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(refreshTokenGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
