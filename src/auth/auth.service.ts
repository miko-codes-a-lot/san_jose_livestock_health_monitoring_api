import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import axios from 'axios';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  verifyJwt(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: 'secret',
    });
  }

  async signIn(username: string, password: string) {
    const user = await this.userService.findByOneUsername(username);
    if (!user)
      throw new BadRequestException('Username or password is incorrect');

    const isCorrectPwd = await bcrypt.compare(password, user.password || '');

    if (!isCorrectPwd)
      throw new BadRequestException('Username or password is incorrect');

    user.password = undefined;

    const payload = {
      sub: user._id.toString(),
      username,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user,
      accessToken,
    };
  }

    // 1️⃣ Generate OTP
  async generateResetOtp(username: string) {
    const user = await this.userService.findForOtp(username);
    // prevent user enumeration
    if (!user) {
      throw new BadRequestException('User Does not exists');
    };
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 1000 * 60 * 5); // 5 mins

    user.resetOtp = otp;
    user.resetOtpExpires = expiry;
    user.resetOtpVerified = false;

    await user.save();
    
    await axios.post(
      'https://api.semaphore.co/api/v4/messages',
      new URLSearchParams({
        apikey: process.env.SEMAPHORE_API_KEY as string,
        number: user.mobileNumber, // 639XXXXXXXXX
        message: `Your OTP is ${otp}. Valid for 5 minutes.`,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
  }

  // 2️⃣ Verify OTP
  async verifyResetOtp(username: string, otp: string) { 
    const user = await this.userService.findForOtp(username);

    if (
      !user ||
      user.resetOtp !== otp ||
      !user.resetOtpExpires ||
      user.resetOtpExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.resetOtpVerified = true;
    await user.save();
  }

  // 3️⃣ Reset password
  async resetPasswordWithOtp(username: string, newPassword: string) {
    const user = await this.userService.findForOtp(username);

    if (
      !user ||
      !user.resetOtpVerified ||
      !user.resetOtpExpires ||
      user.resetOtpExpires < new Date()
    ) {
      throw new BadRequestException('OTP not verified');
    }

    user.password = await bcrypt.hash(newPassword, 10);

    // clear OTP after use
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpVerified = false;

    await user.save();
  }

  
}
