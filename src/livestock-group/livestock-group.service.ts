import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LivestockGroup,
  LivestockGroupDocument,
} from './entities/livestock-group.entity';
import mongoose, { Model } from 'mongoose';
import { LivestockGroupUpsertDto } from './dto/livestock-group-upsert.dto';

@Injectable()
export class LivestockGroupService {
  constructor(
    @InjectModel(LivestockGroup.name)
    private readonly groupModel: Model<LivestockGroupDocument>,
  ) {}

  findAll() {
    return this.groupModel.find();
  }

  findOne(id: string) {
    return this.groupModel.findOne({ _id: id }).populate('livestocks');
  }

  async updateGroupPhotos(id: string, fileNames: string[]) {
    const updatedDoc = await this.groupModel.findByIdAndUpdate(
      id,
      { groupPhotos: fileNames },
      { new: true, runValidators: true },
    );

    if (!updatedDoc) {
      throw new BadRequestException(
        `Livestock Group with ID "${id}" not found.`,
      );
    }

    return updatedDoc;
  }

  async upsert(doc: LivestockGroupUpsertDto, id?: string) {
    const dup = await this.groupModel.findOne({
      ...(id && { _id: { $ne: id } }),
      groupName: doc.groupName,
    });

    if (dup)
      throw new BadRequestException(
        `Group name is already taken: "${doc.groupName}"`,
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
