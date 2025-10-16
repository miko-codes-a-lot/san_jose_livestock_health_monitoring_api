import { IsEnum, IsNotEmpty } from 'class-validator';
import { InsurancePolicyStatus } from '../entities/insurance-policy.entity';

export class UpdateInsurancePolicyStatusDto {
  @IsEnum(InsurancePolicyStatus)
  @IsNotEmpty()
  readonly status: InsurancePolicyStatus;
}
