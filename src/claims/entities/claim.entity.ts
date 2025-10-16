import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { InsurancePolicy } from 'src/insurance-policies/entities/insurance-policy.entity';
import { Livestock } from 'src/livestock/entities/livestock.entity';
import { User } from 'src/users/entities/user.entity';

export enum ClaimStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export type ClaimDocument = HydratedDocument<Claim>;

@Schema({
  collection: 'claims',
  timestamps: true,
})
export class Claim {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User.name })
  farmer: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => InsurancePolicy.name,
  })
  policy: InsurancePolicy;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Livestock.name })
  animal: Livestock;

  @Prop()
  dateOfDeath: Date;

  @Prop()
  causeOfDeathCategory: string;

  @Prop()
  causeOfDeath: string;

  @Prop()
  evidencePhotos: string[];

  @Prop({
    type: String,
    enum: ClaimStatus,
    default: ClaimStatus.DRAFT,
  })
  status: ClaimStatus;

  // who processed the claim
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User.name })
  technician: User;

  @Prop()
  reimbursementAmount: number;

  @Prop()
  processingNotes: string;

  @Prop()
  filedAt: Date;

  @Prop()
  processedAt: Date;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
