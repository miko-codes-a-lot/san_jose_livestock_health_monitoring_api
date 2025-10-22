import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Put,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { LivestockClassificationUpsertDto } from './dto/livestock-classification-upsert.dto';
import { LivestockClassificationService } from './livestock-classifications.service';

@Controller('livestock-classifications')
export class LivestockClassificationController {
  constructor(
    private readonly classificationService: LivestockClassificationService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.classificationService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doc = await this.classificationService.findOne(id);
    if (!doc) {
      throw new NotFoundException(`LivestockClassification not found`);
    }
    return doc;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() doc: LivestockClassificationUpsertDto) {
    return this.classificationService.upsert(doc);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() doc: LivestockClassificationUpsertDto,
  ) {
    const updatedDoc = await this.classificationService.upsert(doc, id);
    if (!updatedDoc) {
      throw new NotFoundException(`LivestockClassification not found`);
    }
    return updatedDoc;
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.classificationService.remove(id);
    return {
      message: 'Livestock classification deleted successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
