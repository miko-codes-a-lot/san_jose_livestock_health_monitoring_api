import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type LivestockClassificationDocument =
  HydratedDocument<LivestockClassification>;

@Schema({
  collection: 'livestock_classifications',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class LivestockClassification {
  _id: mongoose.Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  icon: string;

  @Prop()
  description: string;
}

export const LivestockClassificationSchema = SchemaFactory.createForClass(
  LivestockClassification,
);

LivestockClassificationSchema.virtual('breeds', {
  ref: 'LivestockBreed',
  localField: '_id',
  foreignField: 'classification',
  justOne: false,
});
