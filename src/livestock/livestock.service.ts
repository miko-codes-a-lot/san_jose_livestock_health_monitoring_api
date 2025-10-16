import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Livestock, LivestockDocument } from './entities/livestock.entity';
import mongoose, { Model } from 'mongoose';
import { LivestockUpsertDto } from './dto/livestock-upsert.dto';

@Injectable()
export class LivestockService {
  constructor(
    @InjectModel(Livestock.name)
    private readonly groupModel: Model<LivestockDocument>,
  ) {}

  findAll() {
    return this.groupModel.find();
  }

  findOne(id: string) {
    return this.groupModel.findOne({ _id: id });
  }

  async updateAnimalPhotos(id: string, fileNames: string[]) {
    const updatedDoc = await this.groupModel.findByIdAndUpdate(
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
    const dup = await this.groupModel.findOne({
      ...(id && { _id: { $ne: id } }),
      tagNumber: doc.tagNumber,
      livestockGroup: doc.livestockGroup,
    });

    if (dup)
      throw new BadRequestException(
        `Group tag is already taken within the group: "${doc.tagNumber}"`,
      );

    return this.groupModel.findOneAndUpdate(
      { _id: id || new mongoose.Types.ObjectId() },
      {
        $set: doc,
      },
      { upsert: true, new: true },
    );
  }
}
