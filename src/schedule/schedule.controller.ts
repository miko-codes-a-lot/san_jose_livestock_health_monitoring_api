import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Put,
  Patch
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { UpsertScheduleDto } from './dto/upsert-schedule.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doc = await this.scheduleService.findOne(id);
    if (!doc) {
      throw new NotFoundException('Health Record not found');
    }

    return doc;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() doc: UpsertScheduleDto) {
    return this.scheduleService.upsert(doc);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(@Param('id') id: string, @Body() doc: UpsertScheduleDto) {
    return this.scheduleService.upsert(doc, id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id/process')
  async processSchedule(
    @Param('id') id: string,
    @Body() doc: UpdateScheduleStatusDto,
  ) {
    const updatedClaim = await this.scheduleService.processSchedule(id, doc);
    return {
      message: `Claim status successfully updated to "${doc.status}".`,
      data: updatedClaim,
    };
  }
}
