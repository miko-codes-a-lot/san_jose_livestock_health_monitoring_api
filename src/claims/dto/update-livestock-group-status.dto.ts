import { IsEnum, IsNotEmpty } from 'class-validator';
import { ClaimStatus } from '../entities/claim.entity';

export class UpdateClaimStatusDto {
  @IsEnum(ClaimStatus)
  @IsNotEmpty()
  readonly status: ClaimStatus;
}
