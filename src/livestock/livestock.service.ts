import { Injectable } from '@nestjs/common';
import { CreateLivestockDto } from './dto/create-livestock.dto';
import { UpdateLivestockDto } from './dto/update-livestock.dto';

@Injectable()
export class LivestockService {
  create(createLivestockDto: CreateLivestockDto) {
    return 'This action adds a new livestock';
  }

  findAll() {
    return `This action returns all livestock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} livestock`;
  }

  update(id: number, updateLivestockDto: UpdateLivestockDto) {
    return `This action updates a #${id} livestock`;
  }

  remove(id: number) {
    return `This action removes a #${id} livestock`;
  }
}
