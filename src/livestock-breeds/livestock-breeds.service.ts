import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  LivestockBreed,
  LivestockBreedDocument,
} from './entities/livestock-breed.entity';
import { LivestockBreedUpsertDto } from './dto/livestock-breed-upsert.dto';

@Injectable()
export class LivestockBreedService {
  constructor(
    @InjectModel(LivestockBreed.name)
    private readonly livestockBreedModel: Model<LivestockBreedDocument>,
  ) {}

  findAll(classificationId?: string) {
    const filter = classificationId ? { classification: classificationId } : {};
    return this.livestockBreedModel.find(filter).populate('classification');
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
    return this.livestockBreedModel
      .findOne({ _id: id })
      .populate('classification');
  }

  /**
   * Checks if any breed is associated with a given classification ID.
   * @param classificationId The ID of the classification to check.
   * @returns A boolean indicating if an association exists.
   */
  async hasBreedsForClassification(classificationId: string): Promise<boolean> {
    const existingBreed = await this.livestockBreedModel.findOne({
      classification: classificationId,
    });
    return !!existingBreed;
  }

  async upsert(doc: LivestockBreedUpsertDto, id?: string) {
    const dup = await this.livestockBreedModel.findOne({
      ...(id && { _id: { $ne: id } }),
      name: doc.name,
      classification: doc.classification,
    });

    if (dup) {
      throw new BadRequestException(
        `A breed with the name "${doc.name}" already exists for this classification.`,
      );
    }

    return this.livestockBreedModel.findOneAndUpdate(
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

    const doc = await this.livestockBreedModel.findByIdAndDelete(id);
    if (!doc) {
      throw new NotFoundException(`LivestockBreed with ID "${id}" not found.`);
    }
    return doc;
  }
}
