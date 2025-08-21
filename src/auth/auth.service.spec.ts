import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from './token.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { compare } from 'bcryptjs';

jest.mock('bcryptjs');

const mockUser: User = {
  id: 'random-uuid',
  email: 'test@example.com',
  password: 'hashedpassword',
  createdAt: new Date(),
};

const mockUserService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const mockTokenService = {
  generateTokens: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return tokens on successful sign in', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockTokenService.generateTokens.mockResolvedValue(tokens);

      const result = await authService.signIn(
        'test@example.com',
        'validpassword',
      );

      expect(result).toEqual(tokens);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(compare).toHaveBeenCalledWith('validpassword', mockUser.password);
      expect(mockTokenService.generateTokens).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.signIn('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateTokens', () => {
    it('should return new tokens if user is found', async () => {
      const userId = 'random-uuid';
      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockUserService.findById.mockResolvedValue(mockUser);
      mockTokenService.generateTokens.mockResolvedValue(tokens);

      const result = await authService.updateTokens(userId);

      expect(mockUserService.findById).toHaveBeenCalledWith(userId);
      expect(mockTokenService.generateTokens).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(tokens);
    });
  });
});
