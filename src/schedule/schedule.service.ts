import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Schedule,
  ScheduleDocument,
} from './entities/schedule.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UpsertScheduleDto } from './dto/upsert-schedule.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
  ) {}

  findAll() {
    return this.scheduleModel.find()
      .populate('animal')
      .populate('healthRecord')
      .populate('assignedVet');
  }

  findOne(id: string) {
    return this.scheduleModel
      .findOne({ _id: id })
  }

  async upsert(doc: UpsertScheduleDto, id?: string) {
    return this.scheduleModel.findOneAndUpdate(
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

  async processSchedule(id: string, dto: UpdateScheduleStatusDto) {
    const updatedSchedule = await this.scheduleModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...dto,
          processedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updatedSchedule) {
      throw new NotFoundException(`Schedule with ID "${id}" not found.`);
    }

    return updatedSchedule;
  }
}
