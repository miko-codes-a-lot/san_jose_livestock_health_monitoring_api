import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { Response } from 'express';

import {
  ForgotPasswordOtpDto,
  VerifyOtpDto,
  ResetPasswordOtpDto,
} from './dto/auth-otp.dto';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  async signIn(@Body() credentials: SignInDto, @Res() res: Response) {
    const { user, accessToken } = await this.authService.signIn(
      credentials.username,
      credentials.password,
    );

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return res.status(200).send({ user });
  }

  @Post('sign-out')
  signOut(@Res() res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordOtpDto) {
    console.log('dto.username', dto.username);
    await this.authService.generateResetOtp(dto.username);
    return { message: 'If account exists, OTP sent.' };
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    await this.authService.verifyResetOtp(dto.username, dto.otp);
    return { message: 'OTP verified' };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordOtpDto) {
    await this.authService.resetPasswordWithOtp(
      dto.username,
      dto.newPassword,
    );
    return { message: 'Password successfully reset' };
  }

}
