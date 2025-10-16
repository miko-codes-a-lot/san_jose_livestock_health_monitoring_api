import { Module } from '@nestjs/common';
import { LivestockService } from './livestock.service';
import { LivestockController } from './livestock.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Livestock, LivestockSchema } from './entities/livestock.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Livestock.name, schema: LivestockSchema },
    ]),
  ],
  controllers: [LivestockController],
  providers: [LivestockService],
  exports: [LivestockService],
})
export class LivestockModule {}
