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
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthorizedRequest } from 'src/types/authorized-request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/auth',
    });

    return { accessToken };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('refresh_token');

    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  getProfile(@Req() req: AuthorizedRequest) {
    const { iat, exp, ...user } = req.user!;

    return user;
  }
}
