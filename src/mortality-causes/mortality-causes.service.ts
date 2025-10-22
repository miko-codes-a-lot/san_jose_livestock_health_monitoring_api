import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  MortalityCause,
  MortalityCauseDocument,
} from './entities/mortality-cause.entity';
import { MortalityCauseUpsertDto } from './dto/mortality-cause-upsert.dto';

@Injectable()
export class MortalityCauseService {
  constructor(
    @InjectModel(MortalityCause.name)
    private readonly mortalityCauseModel: Model<MortalityCauseDocument>,
  ) {}

  findAll() {
    return this.mortalityCauseModel.find().exec();
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
    return this.mortalityCauseModel.findOne({ _id: id }).exec();
  }

  async upsert(doc: MortalityCauseUpsertDto, id?: string) {
    // Check for duplicate value, as it's marked unique in the schema
    const dup = await this.mortalityCauseModel.findOne({
      ...(id && { _id: { $ne: id } }),
      value: doc.value,
    });

    if (dup) {
      throw new BadRequestException(
        `A mortality cause with the value "${doc.value}" already exists.`,
      );
    }

    return this.mortalityCauseModel.findOneAndUpdate(
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

    // No dependencies to check based on provided code
    const doc = await this.mortalityCauseModel.findByIdAndDelete(id);
    if (!doc) {
      throw new NotFoundException(`MortalityCause with ID "${id}" not found.`);
    }
    return doc;
  }
}
