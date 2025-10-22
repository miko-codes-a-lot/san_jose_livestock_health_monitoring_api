import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Livestock, LivestockDocument } from './entities/livestock.entity';
import mongoose, { Model } from 'mongoose';
import { LivestockUpsertDto } from './dto/livestock-upsert.dto';
import { LivestockGroupStatus } from 'src/livestock-group/entities/livestock-group.entity';

@Injectable()
export class LivestockService {
  constructor(
    @InjectModel(Livestock.name)
    private readonly livestockModel: Model<LivestockDocument>,
  ) {}

  findAll() {
    return this.livestockModel.find()
    .populate('breed', 'name')
    .populate('species', 'name')
  }

  findOne(id: string) {
    return this.livestockModel.findOne({ _id: id }).populate('healthRecords');
  }

  updateStatusByGroupId(groupId: string, status: LivestockGroupStatus) {
    return this.livestockModel.updateMany(
      { livestockGroup: groupId },
      { $set: { status, statusAt: new Date() } },
    );
  }

  async updateAnimalPhotos(id: string, fileNames: string[]) {
    const updatedDoc = await this.livestockModel.findByIdAndUpdate(
      id,
      { animalPhotos: fileNames },
      { new: true, runValidators: true },
    );

    if (!updatedDoc) {
      throw new BadRequestException(`Livestock with ID "${id}" not found.`);
    }

    return updatedDoc;
  }

  async upsert(doc: LivestockUpsertDto, id?: string) {
    const dup = await this.livestockModel.findOne({
      ...(id && { _id: { $ne: id } }),
      tagNumber: doc.tagNumber,
      livestockGroup: doc.livestockGroup,
    });

    if (dup)
      throw new BadRequestException(
        `Group tag is already taken within the group: "${doc.tagNumber}"`,
      );

    return this.livestockModel.findOneAndUpdate(
      { _id: id || new mongoose.Types.ObjectId() },
      {
        $set: doc,
        $setOnInsert: {
          statusAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
  }
}
