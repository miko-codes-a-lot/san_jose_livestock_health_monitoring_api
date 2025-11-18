import { IsEnum, IsNotEmpty } from 'class-validator';
import { ScheduleStatus } from '../entities/schedule.entity';

export class UpdateScheduleStatusDto {
  @IsEnum(ScheduleStatus)
  @IsNotEmpty()
  readonly status: ScheduleStatus;
}
