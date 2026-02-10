import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import mongoose, { Model } from 'mongoose';
import { UserUpsertDto } from './dto/user-upsert';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findByOneUsername(username: string) {
    return this.userModel.findOne({ username }).select('+password');
  }

  findAll(role?: string) {
    return this.userModel.find({
      ...(role && { role }),
    });
  }

  findOne(id: string) {
    return this.userModel.findOne({ _id: id });
  }

  async updateProfilePicture(id: string, fileName: string) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { profilePicture: fileName },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new BadRequestException(`User with ID "${id}" not found.`);
    }

    return updatedUser;
  }

  async changePassword(id: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new BadRequestException(`User with ID "${id}" not found.`);
    }

    return updatedUser;
  }

  async upsert(doc: UserUpsertDto, id?: string) {
    if (doc.password) {
      doc.password = await bcrypt.hash(doc.password, 10);
    } else {
      delete doc.password;
    }

    const dup = await this.userModel.findOne({
      ...(id && { _id: { $ne: id } }),
      username: doc.username,
    });

    if (dup)
      throw new BadRequestException(
        `Username is already taken: "${doc.username}"`,
      );

    return this.userModel.findOneAndUpdate(
      { _id: id || new mongoose.Types.ObjectId() },
      {
        $set: doc,
      },
      { upsert: true, new: true },
    );
  }

  async findForOtp(username: string) {
    return this.userModel
      .findOne({ username })
      .select('+resetOtp +resetOtpExpires +resetOtpVerified +password');
  }
}
