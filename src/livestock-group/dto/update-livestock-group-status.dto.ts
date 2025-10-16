import { IsEnum, IsNotEmpty } from 'class-validator';
import { LivestockGroupStatus } from '../entities/livestock-group.entity';

export class UpdateLivestockGroupStatusDto {
  @IsEnum(LivestockGroupStatus)
  @IsNotEmpty()
  readonly status: LivestockGroupStatus;
}
