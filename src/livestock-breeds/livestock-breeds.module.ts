import { Module } from '@nestjs/common';
import { LivestockBreedService } from './livestock-breeds.service';
import { LivestockBreedController } from './livestock-breeds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LivestockBreed,
  LivestockBreedSchema,
} from './entities/livestock-breed.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LivestockBreed.name,
        schema: LivestockBreedSchema,
      },
    ]),
  ],
  controllers: [LivestockBreedController],
  providers: [LivestockBreedService],
  exports: [LivestockBreedService],
})
export class LivestockBreedsModule {}
