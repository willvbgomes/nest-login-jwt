import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { TokenService } from './token.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    const isPasswordValid = await compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { createdAt, password, ...userData } = user;

    return await this.tokenService.generateTokens(userData);
  }
}
