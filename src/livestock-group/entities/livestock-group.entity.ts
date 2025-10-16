import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

export enum LivestockGroupStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export type LivestockGroupDocument = HydratedDocument<LivestockGroup>;

@Schema({
  collection: 'livestock_groups',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class LivestockGroup {
  _id: mongoose.Types.ObjectId;

  @Prop()
  groupName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User.name })
  farmer: User;

  @Prop({
    type: String,
    enum: LivestockGroupStatus,
    default: LivestockGroupStatus.DRAFT,
  })
  status: LivestockGroupStatus;

  @Prop()
  statusAt: Date;

  @Prop()
  groupPhotos: string[];
}

export const LivestockGroupSchema =
  SchemaFactory.createForClass(LivestockGroup);

LivestockGroupSchema.virtual('livestocks', {
  ref: 'Livestock',
  localField: '_id',
  foreignField: 'livestockGroup',
  justOne: false,
});
