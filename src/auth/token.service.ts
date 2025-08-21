import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens({ id, email }: Pick<User, 'id' | 'email'>) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: id, email }),
      this.jwtService.signAsync({ sub: id }, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }
}
