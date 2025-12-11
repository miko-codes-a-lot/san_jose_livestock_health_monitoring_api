import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export enum ScheduleType {
  VACCINATION = 'vaccination',
  DEWORMING = 'deworming',
  TREATMENT = 'treatment',
  CHECKUP = 'checkup',
}

export enum ScheduleStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  COMPLETED = 'completed',
}

export class UpsertScheduleDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly farmer: string; // livestock ObjectId

  @IsMongoId()
  @IsNotEmpty()
  readonly animal: string; // livestock ObjectId

  @IsMongoId()
  @IsNotEmpty()
  readonly healthRecord: string; // health record ObjectId

  @IsMongoId()
  @IsNotEmpty()
  readonly createdBy: string; // technician ObjectId

  @IsMongoId()
  @IsNotEmpty()
  readonly assignedVet: string; // vet ObjectId

  @IsEnum(ScheduleType)
  @IsNotEmpty()
  readonly type: ScheduleType;

  @IsDateString()
  @IsNotEmpty()
  readonly scheduledDate: Date;

  @IsEnum(ScheduleStatus)
  @IsOptional()
  readonly status?: ScheduleStatus; // default to 'pending' if not provided
}
