import { IsString, IsNotEmpty, IsMongoId, IsDateString } from 'class-validator';

export class InsurancePolicyUpsertDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly farmer: string;

  @IsMongoId()
  @IsNotEmpty()
  readonly livestockGroup: string;

  @IsString()
  @IsNotEmpty()
  readonly policyNumber: string;

  @IsString()
  @IsNotEmpty()
  readonly provider: string;

  @IsDateString()
  @IsNotEmpty()
  readonly startDate: string;

  @IsDateString()
  @IsNotEmpty()
  readonly endDate: string;
}
