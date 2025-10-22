import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { LivestockClassification } from 'src/livestock-classifications/entities/livestock-classification.entity';

export type LivestockBreedDocument = HydratedDocument<LivestockClassification>;

@Schema({
  collection: 'livestock_breeds',
  timestamps: true,
})
export class LivestockBreed {
  _id: mongoose.Types.ObjectId;

  @Prop()
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LivestockClassification',
  })
  classification: LivestockClassification;
}

export const LivestockBreedSchema =
  SchemaFactory.createForClass(LivestockBreed);
