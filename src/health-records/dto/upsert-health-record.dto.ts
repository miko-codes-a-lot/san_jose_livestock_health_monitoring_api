import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { BodyCondition } from '../entities/health-record.entity';

export class UpsertHealthRecordDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly animal: string; // The client will send the ObjectId string

  @IsMongoId()
  @IsNotEmpty()
  readonly technician: string; // The client will send the ObjectId string

  @IsDateString()
  @IsNotEmpty()
  readonly visitDate: Date;

  @IsEnum(BodyCondition)
  @IsNotEmpty()
  readonly bodyCondition: BodyCondition;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  readonly weightKg: number;

  @IsDateString()
  @IsOptional()
  readonly dewormingDate?: Date;

  @IsDateString()
  @IsOptional()
  readonly vaccinationDate?: Date;

  @IsString()
  @IsOptional()
  readonly vitaminsAdministered?: string;

  @IsString()
  @IsOptional()
  readonly symptomsObserved?: string;

  @IsString()
  @IsOptional()
  readonly diagnosis?: string;

  @IsString()
  @IsOptional()
  readonly treatmentGiven?: string;

  @IsString()
  readonly notes: string;
}
