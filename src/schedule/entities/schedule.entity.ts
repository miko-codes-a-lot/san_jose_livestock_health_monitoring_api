import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Livestock } from 'src/livestock/entities/livestock.entity';
import { User } from 'src/users/entities/user.entity';
import { HealthRecord } from '../../health-records/entities/health-record.entity'; // adjust path if needed

export type ScheduleDocument = HydratedDocument<Schedule>;

export enum ScheduleType {
  VACCINATION = 'vaccination',
  DEWORMING = 'deworming',
  // TREATMENT = 'treatment',
  // CHECKUP = 'checkup',
}

export enum ScheduleStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  COMPLETED = 'completed',
}

@Schema({
  collection: 'schedules',
  timestamps: true, // createdAt, updatedAt
})
export class Schedule {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => User.name,
    required: true,
  })
  farmer: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => Livestock.name,
    required: true,
  })
  animal: Livestock;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => HealthRecord.name,
    required: true,
  })
  healthRecord: HealthRecord;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => User.name,
    required: true,
  })
  createdBy: User; // technician

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => User.name,
    required: true,
  })
  assignedVet: User; // vet

  @Prop({ type: String, enum: ScheduleType, required: true })
  type: ScheduleType;

  @Prop({ type: Date, required: true })
  scheduledDate: Date;

  @Prop({ type: String, enum: ScheduleStatus, default: ScheduleStatus.PENDING })
  status: ScheduleStatus;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
