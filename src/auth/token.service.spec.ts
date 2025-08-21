import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    tokenService = module.get(TokenService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tokenService).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should generate and return access and refresh tokens', async () => {
      const userData = { id: 'user-id-123', email: 'test@example.com' };
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await tokenService.generateTokens(userData);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, {
        sub: userData.id,
        email: userData.email,
      });
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: userData.id },
        { expiresIn: '7d' },
      );
      expect(result).toEqual({ accessToken, refreshToken });
    });
  });
});
