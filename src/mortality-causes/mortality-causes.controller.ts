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
import { MortalityCauseUpsertDto } from './dto/mortality-cause-upsert.dto';
import { MortalityCauseService } from './mortality-causes.service';

@Controller('mortality-causes')
export class MortalityCauseController {
  constructor(private readonly mortalityCauseService: MortalityCauseService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.mortalityCauseService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doc = await this.mortalityCauseService.findOne(id);
    if (!doc) {
      throw new NotFoundException(`MortalityCause not found`);
    }
    return doc;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() doc: MortalityCauseUpsertDto) {
    return this.mortalityCauseService.upsert(doc);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(@Param('id') id: string, @Body() doc: MortalityCauseUpsertDto) {
    const updatedDoc = await this.mortalityCauseService.upsert(doc, id);
    if (!updatedDoc) {
      throw new NotFoundException(`MortalityCause not found`);
    }
    return updatedDoc;
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.mortalityCauseService.remove(id);
    return {
      message: 'Mortality cause deleted successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
