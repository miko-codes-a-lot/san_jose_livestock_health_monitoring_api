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
  Query,
} from '@nestjs/common';
import { LivestockBreedUpsertDto } from './dto/livestock-breed-upsert.dto';
import { LivestockBreedService } from './livestock-breeds.service';

@Controller('livestock-breeds')
export class LivestockBreedController {
  constructor(private readonly breedService: LivestockBreedService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(@Query('classificationId') classificationId?: string) {
    return this.breedService.findAll(classificationId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doc = await this.breedService.findOne(id);
    if (!doc) {
      throw new NotFoundException(`LivestockBreed not found`);
    }
    return doc;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() doc: LivestockBreedUpsertDto) {
    return this.breedService.upsert(doc);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(@Param('id') id: string, @Body() doc: LivestockBreedUpsertDto) {
    const updatedDoc = await this.breedService.upsert(doc, id);
    if (!updatedDoc) {
      throw new NotFoundException(`LivestockBreed not found`);
    }
    return updatedDoc;
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.breedService.remove(id);
    return {
      message: 'Livestock breed deleted successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
