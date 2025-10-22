import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MortalityCauseDocument = HydratedDocument<MortalityCauseItem>;

@Schema({
  _id: false,
})
export class MortalityCauseItem {
  @Prop()
  label: string;

  @Prop()
  value: string;
}

@Schema({
  collection: 'mortality_causes',
  timestamps: true,
})
export class MortalityCause {
  _id: mongoose.Types.ObjectId;

  @Prop()
  label: string;

  @Prop()
  value: string;

  @Prop()
  items: MortalityCauseItem[];
}

export const MortalityCauseSchema =
  SchemaFactory.createForClass(MortalityCause);
