import { Injectable } from '@nestjs/common';
import {
  HealthRecord,
  HealthRecordDocument,
} from './entities/health-record.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UpsertHealthRecordDto } from './dto/upsert-health-record.dto';

@Injectable()
export class HealthRecordsService {
  constructor(
    @InjectModel(HealthRecord.name)
    private readonly livestockModel: Model<HealthRecordDocument>,
  ) {}

  findAll() {
    return this.livestockModel.find().populate('technician').populate('animal');
  }

  findOne(id: string) {
    return this.livestockModel
      .findOne({ _id: id })
      .populate('animal')
      .populate('technician');
  }

  async upsert(doc: UpsertHealthRecordDto, id?: string) {
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
