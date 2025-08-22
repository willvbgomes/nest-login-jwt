import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedRequest } from 'src/types/authenticated-request';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/auth',
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() { email, password }: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signIn(
      email,
      password,
    );

    this.setCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('refresh_token', { path: '/api/auth' });

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    const { iat, exp, ...user } = req.user!;

    return user;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async updateTokens(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user!.sub;
    const { accessToken, refreshToken } =
      await this.authService.updateTokens(userId);

    this.setCookie(res, refreshToken);

    return { accessToken };
  }
}
