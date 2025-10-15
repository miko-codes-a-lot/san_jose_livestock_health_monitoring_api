import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  _id: false,
})
export class Address {
  @Prop()
  barangay: string;

  @Prop()
  municipality: string;

  @Prop()
  province: string;
}

@Schema({
  collection: 'users',
  timestamps: true,
})
export class User {
  _id: mongoose.Types.ObjectId;

  @Prop()
  profilePicture?: string; // image name

  @Prop()
  firstName: string;

  @Prop()
  middleName?: string;

  @Prop()
  lastName: string;

  @Prop()
  emailAddress: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  address: Address;

  // for farmers
  @Prop()
  rsbsaNumber?: string;

  @Prop()
  username: string;

  @Prop({ select: false })
  password?: string;

  @Prop()
  role: string; // farmer, technician, admin
}

export const UserSchema = SchemaFactory.createForClass(User);
