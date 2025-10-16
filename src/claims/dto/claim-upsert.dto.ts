import { IsDateString, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ClaimUpsertDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly farmer: string;

  @IsMongoId()
  @IsNotEmpty()
  readonly policy: string;

  @IsMongoId()
  @IsNotEmpty()
  readonly animal: string;

  @IsDateString()
  @IsNotEmpty()
  readonly dateOfDeath: string;

  @IsString()
  @IsNotEmpty()
  readonly causeOfDeathCategory: string;

  @IsString()
  @IsNotEmpty()
  readonly causeOfDeath: string;

  @IsDateString()
  @IsNotEmpty()
  readonly filedAt: string;
}
