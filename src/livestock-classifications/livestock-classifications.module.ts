import { Module } from '@nestjs/common';
import { LivestockClassificationController } from './livestock-classifications.controller';
import { LivestockClassificationService } from './livestock-classifications.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LivestockClassification,
  LivestockClassificationSchema,
} from './entities/livestock-classification.entity';
import { LivestockBreedsModule } from 'src/livestock-breeds/livestock-breeds.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LivestockClassification.name,
        schema: LivestockClassificationSchema,
      },
    ]),
    LivestockBreedsModule,
  ],
  controllers: [LivestockClassificationController],
  providers: [LivestockClassificationService],
})
export class LivestockClassificationsModule {}
