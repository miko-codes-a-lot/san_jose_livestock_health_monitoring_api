import { Module } from '@nestjs/common';
import { LivestockGroupService } from './livestock-group.service';
import { LivestockGroupController } from './livestock-group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LivestockGroup,
  LivestockGroupSchema,
} from './entities/livestock-group.entity';
import { LivestockModule } from 'src/livestock/livestock.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LivestockGroup.name, schema: LivestockGroupSchema },
    ]),
    LivestockModule,
  ],
  controllers: [LivestockGroupController],
  providers: [LivestockGroupService],
})
export class LivestockGroupModule {}
