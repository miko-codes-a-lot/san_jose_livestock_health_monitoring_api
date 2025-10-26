import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LivestockGroup,
  LivestockGroupDocument,
  LivestockGroupStatus,
} from './entities/livestock-group.entity';
import mongoose, { Model } from 'mongoose';
import { LivestockGroupUpsertDto } from './dto/livestock-group-upsert.dto';
import { LivestockService } from 'src/livestock/livestock.service';

@Injectable()
export class LivestockGroupService {
  constructor(
    @InjectModel(LivestockGroup.name)
    private readonly groupModel: Model<LivestockGroupDocument>,
    private readonly livestockService: LivestockService,
  ) {}

  findAll() {
    return this.groupModel.find().populate('farmer');
  }

  findOne(id: string) {
    return this.groupModel.findOne({ _id: id }).populate({
      path: 'livestocks',
      populate: [{ path: 'breed' }, { path: 'species' }],
    });
  }

  async updateStatus(id: string, status: LivestockGroupStatus) {
    const updatedGroup = await this.groupModel.findByIdAndUpdate(
      id,
      { $set: { status, statusAt: new Date() } },
      { new: true },
    );

    if (!updatedGroup) {
      throw new NotFoundException(`Livestock Group with ID "${id}" not found.`);
    }

    // cascade the status update to all child Livestock entities
    await this.livestockService.updateStatusByGroupId(id, status);

    return updatedGroup;
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
        $setOnInsert: {
          statusAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
  }
}
