import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SignInDto } from './dto/sign-in.dto';
import { AuthenticatedRequest } from 'src/types/authenticated-request';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

const mockAuthService = {
  signIn: jest.fn(),
  updateTokens: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        AccessTokenGuard,
        RefreshTokenGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: 'test@example.com',
      password: 'password',
    };

    const tokens = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    };

    const mockResponse = {
      cookie: jest.fn(),
    } as unknown as Response;

    beforeEach(() => {
      mockAuthService.signIn.mockResolvedValue(tokens);
    });

    it('should call authService.signIn and return an access token', async () => {
      const result = await authController.signIn(signInDto, mockResponse);

      expect(authService.signIn).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
      expect(result).toEqual({ accessToken: tokens.accessToken });
    });

    it('should call the private setCookie method', async () => {
      const setCookieSpy = jest.spyOn(authController as any, 'setCookie');
      await authController.signIn(signInDto, mockResponse);
      expect(setCookieSpy).toHaveBeenCalledWith(
        mockResponse,
        tokens.refreshToken,
      );
    });
  });

  describe('logout', () => {
    it('should clear the refresh_token cookie and send an OK status', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
        sendStatus: jest.fn(),
      } as unknown as Response;

      authController.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        HttpStatus.NO_CONTENT,
      );
    });
  });

  describe('getProfile', () => {
    it('should return the user profile without iat and exp properties', () => {
      const mockUserPayload = {
        sub: 'random-uuid',
        email: 'test@example.com',
        iat: 1678886400,
        exp: 1678890000,
      };

      const mockRequest: AuthenticatedRequest = {
        user: mockUserPayload,
      } as AuthenticatedRequest;

      const expectedProfile = {
        sub: 'random-uuid',
        email: 'test@example.com',
      };

      const result = authController.getProfile(mockRequest);

      expect(result).toEqual(expectedProfile);
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
    });
  });

  describe('updateTokens', () => {
    const userId = 'random-uuid';
    const mockRequest = {
      user: { sub: userId },
    } as AuthenticatedRequest;

    const tokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    const mockResponse = {
      cookie: jest.fn(),
    } as unknown as Response;

    beforeEach(() => {
      mockAuthService.updateTokens.mockResolvedValue(tokens);
    });

    it('should call authService.updateTokens and return a new access token', async () => {
      const result = await authController.updateTokens(
        mockRequest,
        mockResponse,
      );

      expect(authService.updateTokens).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ accessToken: tokens.accessToken });
    });

    it('should call the private setCookie method', async () => {
      const setCookieSpy = jest.spyOn(authController as any, 'setCookie');
      await authController.updateTokens(mockRequest, mockResponse);
      expect(setCookieSpy).toHaveBeenCalledWith(
        mockResponse,
        tokens.refreshToken,
      );
    });
  });

  describe('setCookie (private method)', () => {
    const refreshToken = 'any-refresh-token';
    const mockResponse = { cookie: jest.fn() } as unknown as Response;

    it.each([
      [true, 'production'],
      [false, 'development'],
      [false, 'test'],
    ])(
      'should set cookie with secure: %s when NODE_ENV is %s',
      (expectedSecure, nodeEnv) => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = nodeEnv;

        (authController as any).setCookie(mockResponse, refreshToken);

        expect(mockResponse.cookie).toHaveBeenCalledWith(
          'refresh_token',
          refreshToken,
          {
            httpOnly: true,
            sameSite: 'strict',
            secure: expectedSecure,
            path: '/api/auth',
          },
        );
        process.env.NODE_ENV = originalNodeEnv;
      },
    );
  });
});
