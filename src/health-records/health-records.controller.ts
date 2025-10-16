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
} from '@nestjs/common';
import { HealthRecordsService } from './health-records.service';
import { UpsertHealthRecordDto } from './dto/upsert-health-record.dto';

@Controller('health-records')
export class HealthRecordsController {
  constructor(private readonly healthRecordsService: HealthRecordsService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.healthRecordsService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doc = await this.healthRecordsService.findOne(id);
    if (!doc) {
      throw new NotFoundException('Health Record not found');
    }

    return doc;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() doc: UpsertHealthRecordDto) {
    return this.healthRecordsService.upsert(doc);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(@Param('id') id: string, @Body() doc: UpsertHealthRecordDto) {
    return this.healthRecordsService.upsert(doc, id);
  }
}
