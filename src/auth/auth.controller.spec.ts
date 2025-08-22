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

    it.each([
      [true, 'production'],
      [false, 'development'],
      [false, 'test'],
    ])(
      'should set cookie with secure: %s when NODE_ENV is %s',
      async (expectedSecure, nodeEnv) => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = nodeEnv;

        await authController.signIn(signInDto, mockResponse);

        expect(mockResponse.cookie).toHaveBeenCalledWith(
          'refresh_token',
          tokens.refreshToken,
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

  describe('logout', () => {
    it('should clear the refresh_token cookie and send an OK status', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
        sendStatus: jest.fn(),
      } as unknown as Response;

      authController.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
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

    it.each([
      [true, 'production'],
      [false, 'development'],
      [false, 'test'],
    ])(
      'should set cookie with secure: %s when NODE_ENV is %s',
      async (expectedSecure, nodeEnv) => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = nodeEnv;

        await authController.updateTokens(mockRequest, mockResponse);

        expect(mockResponse.cookie).toHaveBeenCalledWith(
          'refresh_token',
          tokens.refreshToken,
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
