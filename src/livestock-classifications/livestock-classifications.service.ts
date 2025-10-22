import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  LivestockClassification,
  LivestockClassificationDocument,
} from './entities/livestock-classification.entity';
import { LivestockClassificationUpsertDto } from './dto/livestock-classification-upsert.dto';
import { LivestockBreedService } from 'src/livestock-breeds/livestock-breeds.service';

@Injectable()
export class LivestockClassificationService {
  constructor(
    @InjectModel(LivestockClassification.name)
    private readonly livestockClassificationModel: Model<LivestockClassificationDocument>,
    private readonly livestockBreedService: LivestockBreedService,
  ) {}

  findAll() {
    return this.livestockClassificationModel.find().populate('breeds');
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
    return this.livestockClassificationModel
      .findOne({ _id: id })
      .populate('breeds');
  }

  async upsert(doc: LivestockClassificationUpsertDto, id?: string) {
    const dup = await this.livestockClassificationModel.findOne({
      ...(id && { _id: { $ne: id } }),
      name: doc.name,
    });

    if (dup) {
      throw new BadRequestException(
        `A livestock classification with the name "${doc.name}" already exists.`,
      );
    }

    return this.livestockClassificationModel.findOneAndUpdate(
      { _id: id || new mongoose.Types.ObjectId() },
      {
        $set: doc,
      },
      { upsert: true, new: true, runValidators: true },
    );
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    const hasBreeds =
      await this.livestockBreedService.hasBreedsForClassification(id);

    if (hasBreeds) {
      throw new BadRequestException(
        'Cannot delete classification as it is associated with one or more breeds. Please re-assign or delete breeds first.',
      );
    }

    const doc = await this.livestockClassificationModel.findByIdAndDelete(id);
    if (!doc) {
      throw new NotFoundException(
        `LivestockClassification with ID "${id}" not found.`,
      );
    }
    return doc;
  }
}
