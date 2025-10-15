import { Injectable } from '@nestjs/common';
import { CreateLivestockGroupDto } from './dto/create-livestock-group.dto';
import { UpdateLivestockGroupDto } from './dto/update-livestock-group.dto';

@Injectable()
export class LivestockGroupService {
  create(createLivestockGroupDto: CreateLivestockGroupDto) {
    return 'This action adds a new livestockGroup';
  }

  findAll() {
    return `This action returns all livestockGroup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} livestockGroup`;
  }

  update(id: number, updateLivestockGroupDto: UpdateLivestockGroupDto) {
    return `This action updates a #${id} livestockGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} livestockGroup`;
  }
}
