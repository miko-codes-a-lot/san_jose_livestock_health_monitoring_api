import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

export enum NotificationType {
  SCHEDULE_CREATED = 'SCHEDULE_CREATED',
  SCHEDULE_STATUS_UPDATED = 'SCHEDULE_STATUS_UPDATED',
  SCHEDULE_REMINDER = 'SCHEDULE_REMINDER',
}

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({
  collection: 'notifications',
  timestamps: true,
})
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  recipient: User;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop()
  link?: string; // e.g., /schedule/60d...

  // Optional: The user who triggered the notification
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  triggeredBy?: User;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
