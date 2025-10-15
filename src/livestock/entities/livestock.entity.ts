import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { LivestockGroup } from 'src/livestock-group/entities/livestock-group.entity';
import { Gender, User } from 'src/users/entities/user.entity';

export type LivestockDocument = HydratedDocument<Livestock>;

@Schema({
  collection: 'livestocks',
  timestamps: true,
})
export class Livestock {
  _id: mongoose.Types.ObjectId;

  @Prop()
  tagNumber: string;

  @Prop()
  species: string;

  @Prop()
  breed: string;

  @Prop()
  age: number;

  @Prop()
  sex: Gender;

  @Prop()
  dateOfPurchase: Date;

  @Prop()
  animalPhotos: string[]; // can optionally add photos of the animal

  @Prop()
  isInsured: boolean;

  @Prop()
  isDeceased: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User.name })
  farmer: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => LivestockGroup.name,
  })
  livestockGroup: LivestockGroup;
}

export const LivestockSchema = SchemaFactory.createForClass(Livestock);
