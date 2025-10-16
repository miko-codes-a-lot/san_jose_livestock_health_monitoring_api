import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { LivestockGroup } from 'src/livestock-group/entities/livestock-group.entity';
import { User } from 'src/users/entities/user.entity';

export enum InsurancePolicyStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export type InsurancePolicyDocument = HydratedDocument<InsurancePolicy>;

@Schema({
  collection: 'insurance_policies',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class InsurancePolicy {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User.name })
  farmer: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => LivestockGroup.name,
  })
  livestockGroup: LivestockGroup;

  @Prop()
  policyNumber: string;

  @Prop()
  provider: string;

  @Prop()
  policyDocument: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({
    type: String,
    enum: InsurancePolicyStatus,
    default: InsurancePolicyStatus.DRAFT,
  })
  status: InsurancePolicyStatus;
}

export const InsurancePolicySchema =
  SchemaFactory.createForClass(InsurancePolicy);
