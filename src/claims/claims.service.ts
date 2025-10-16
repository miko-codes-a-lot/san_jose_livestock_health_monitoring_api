import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Claim, ClaimDocument } from './entities/claim.entity';
import { ClaimUpsertDto } from './dto/claim-upsert.dto';
import { UpdateClaimStatusDto } from './dto/update-livestock-group-status.dto';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectModel(Claim.name)
    private readonly claimModel: Model<ClaimDocument>,
  ) {}

  findAll() {
    return this.claimModel
      .find()
      .populate(['farmer', 'policy', 'animal', 'technician']);
  }

  findOne(id: string) {
    return this.claimModel
      .findById(id)
      .populate(['farmer', 'policy', 'animal', 'technician']);
  }

  /**
   * Updates the evidence photos for a specific claim.
   */
  async updateEvidencePhotos(id: string, fileNames: string[]) {
    const updatedDoc = await this.claimModel.findByIdAndUpdate(
      id,
      { evidencePhotos: fileNames },
      { new: true },
    );

    if (!updatedDoc) {
      throw new NotFoundException(`Claim with ID "${id}" not found.`);
    }

    return updatedDoc;
  }

  async processClaim(id: string, dto: UpdateClaimStatusDto) {
    const updatedClaim = await this.claimModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...dto,
          processedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updatedClaim) {
      throw new NotFoundException(`Claim with ID "${id}" not found.`);
    }

    return updatedClaim;
  }

  async upsert(doc: ClaimUpsertDto, id?: string) {
    // a farmer can only file one claim per deceased animal under a specific policy
    const duplicate = await this.claimModel.findOne({
      ...(id && { _id: { $ne: id } }),
      policy: doc.policy,
      animal: doc.animal,
    });

    if (duplicate) {
      throw new BadRequestException(
        `A claim for this animal under the specified policy already exists.`,
      );
    }

    return this.claimModel.findOneAndUpdate(
      { _id: id || new mongoose.Types.ObjectId() },
      { $set: doc },
      { upsert: true, new: true },
    );
  }
}
