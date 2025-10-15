import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LivestockGroupService } from './livestock-group.service';
import { CreateLivestockGroupDto } from './dto/create-livestock-group.dto';
import { UpdateLivestockGroupDto } from './dto/update-livestock-group.dto';

@Controller('livestock-group')
export class LivestockGroupController {
  constructor(private readonly livestockGroupService: LivestockGroupService) {}

  @Post()
  create(@Body() createLivestockGroupDto: CreateLivestockGroupDto) {
    return this.livestockGroupService.create(createLivestockGroupDto);
  }

  @Get()
  findAll() {
    return this.livestockGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.livestockGroupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLivestockGroupDto: UpdateLivestockGroupDto) {
    return this.livestockGroupService.update(+id, updateLivestockGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.livestockGroupService.remove(+id);
  }
}
