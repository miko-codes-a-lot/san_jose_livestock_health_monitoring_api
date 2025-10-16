import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Livestock } from 'src/livestock/entities/livestock.entity';
import { User } from 'src/users/entities/user.entity';

export enum BodyCondition {
  EMACIATED = 'emaciated',
  IDEAL = 'ideal',
  FAT = 'fat',
  OBESE = 'obese',
  THIN = 'thin',
  PREGNANT = 'pregnant',
  NOT_PREGNANT = 'not_pregnant',
}

export type HealthRecordDocument = HydratedDocument<HealthRecord>;

@Schema({
  collection: 'health_records',
  timestamps: true,
})
export class HealthRecord {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Livestock.name })
  animal: Livestock;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User.name })
  technician: User;

  @Prop()
  visitDate: Date;

  @Prop()
  bodyCondition: BodyCondition;

  @Prop()
  weightKg: number;

  @Prop()
  dewormingDate?: Date;

  @Prop()
  vaccinationDate?: Date;

  @Prop()
  vitaminsAdministered?: string;

  @Prop()
  symptomsObserved?: string;

  @Prop()
  diagnosis?: string;

  @Prop()
  treatmentGiven?: string;

  @Prop()
  notes: string;
}

export const HealthRecordSchema = SchemaFactory.createForClass(HealthRecord);
