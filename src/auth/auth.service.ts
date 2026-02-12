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

    if (!user) {
      throw new BadRequestException('User Does not exists');
    }

    const otp: string = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry: Date = new Date(Date.now() + 1000 * 60 * 5);

    user.resetOtp = otp;
    user.resetOtpExpires = expiry;
    user.resetOtpVerified = false;

    await user.save();

    const message: string = `Your OTP is ${otp}. Valid for 5 minutes.`;

    console.log(`SEND OTP ${otp} TO ${user.mobileNumber}`);

    let messageId: string;

    try {
      messageId = await this.sendViaSemaphore(
        user.mobileNumber,
        message,
      );
    } catch (error) {
      console.log('Semaphore immediate failure. Using Twilio fallback...');
      await this.sendViaTwilio(user.mobileNumber, message);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));

    try {
      const status: string = await this.getSemaphoreStatus(messageId);

      if (status === 'Failed' || status === 'Refunded') {
        console.log('Semaphore delivery failed. Falling back to Twilio...');
        await this.sendViaTwilio(user.mobileNumber, message);
      } else {
        console.log('Semaphore accepted or still processing:', status);
      }
    } catch (error) {
      console.log('Status check failed. Falling back to Twilio...');
      await this.sendViaTwilio(user.mobileNumber, message);
    }
  }

  // --------------------------------
  // 🔥 FORMAT HANDLING (PH ONLY)
  // --------------------------------

  private normalizeTo639(input: string): string {
    let value: string = input.trim();

    if (value.startsWith('+63')) {
      return value.substring(1); // remove "+"
    }

    if (value.startsWith('63')) {
      return value;
    }

    if (value.startsWith('0')) {
      value = value.substring(1);
    }

    if (!value.startsWith('9') || value.length !== 10) {
      throw new Error('Invalid Philippine mobile number format');
    }

    return `63${value}`;
  }

  private normalizeToE164(input: string): string {
    const formatted: string = this.normalizeTo639(input);
    return `+${formatted}`;
  }

  // --------------------------------
  // Semaphore Sender
  // --------------------------------

  private async sendViaSemaphore(
    mobileNumber: string,
    message: string,
  ): Promise<string> {
    const formattedNumber: string = this.normalizeTo639(mobileNumber);

    const response = await axios.post(
      'https://api.semaphore.co/api/v4/messages',
      new URLSearchParams({
        sendername: process.env.SEMAPHORE_SENDER_NAME as string,
        apikey: process.env.SEMAPHORE_API_KEY as string,
        number: formattedNumber,
        message: message,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
      },
    );

    const result = response.data?.[0];

    if (!result || !result.message_id) {
      throw new Error('Semaphore did not return message_id');
    }

    return result.message_id;
  }

  // --------------------------------
  // Semaphore Status Check
  // --------------------------------

  private async getSemaphoreStatus(messageId: string): Promise<string> {
    const response = await axios.get(
      `https://api.semaphore.co/api/v4/messages/${messageId}`,
      {
        params: {
          apikey: process.env.SEMAPHORE_API_KEY,
        },
        timeout: 10000,
      },
    );

    return response.data?.status;
  }

  // --------------------------------
  // Twilio Fallback
  // --------------------------------

  private async sendViaTwilio(
    mobileNumber: string,
    message: string,
  ): Promise<void> {
    const twilio = require('twilio');

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const formattedNumber: string = this.normalizeToE164(mobileNumber);

    await client.messages.create({
      to: formattedNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message,
    });

    console.log('Sent via Twilio');
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
