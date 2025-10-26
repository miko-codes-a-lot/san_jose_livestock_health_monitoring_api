import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  InsurancePolicy,
  InsurancePolicyDocument,
  InsurancePolicyStatus,
} from './entities/insurance-policy.entity';
import { InsurancePolicyUpsertDto } from './dto/insurance-policy-upsert.dto';

@Injectable()
export class InsurancePolicyService {
  constructor(
    @InjectModel(InsurancePolicy.name)
    private readonly policyModel: Model<InsurancePolicyDocument>,
  ) {}

  findAll() {
    return this.policyModel.find().populate(['farmer', 'livestockGroup']);
  }

  findOne(id: string) {
    return this.policyModel.findById(id).populate(['farmer', 'livestockGroup']);
  }

  async updateStatus(id: string, status: InsurancePolicyStatus) {
    const insurancePolicy = await this.policyModel.findByIdAndUpdate(
      id,
      { $set: { status, statusAt: new Date() } },
      { new: true },
    );

    if (!insurancePolicy) {
      throw new NotFoundException(
        `Insurance Policy with ID "${id}" not found.`,
      );
    }

    return insurancePolicy;
  }

  async updatePolicyDocument(id: string, fileName: string) {
    const updatedDoc = await this.policyModel.findByIdAndUpdate(
      id,
      { policyDocument: fileName },
      { new: true },
    );

    if (!updatedDoc) {
      throw new NotFoundException(
        `Insurance Policy with ID "${id}" not found.`,
      );
    }

    return updatedDoc;
  }

  async upsert(doc: InsurancePolicyUpsertDto, id?: string) {
    // check for duplicate policy number to ensure uniqueness
    const duplicate = await this.policyModel.findOne({
      ...(id && { _id: { $ne: id } }),
      policyNumber: doc.policyNumber,
    });

    if (duplicate) {
      throw new BadRequestException(
        `Policy number is already in use: "${doc.policyNumber}"`,
      );
    }

    return this.policyModel.findOneAndUpdate(
      { _id: id || new mongoose.Types.ObjectId() },
      { $set: doc },
      { upsert: true, new: true },
    );
  }
}
