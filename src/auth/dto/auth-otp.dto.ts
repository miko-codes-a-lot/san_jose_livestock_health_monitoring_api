import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordOtpDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ResetPasswordOtpDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
