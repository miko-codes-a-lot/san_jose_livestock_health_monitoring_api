import { Module } from '@nestjs/common';
import { LivestockGroupService } from './livestock-group.service';
import { LivestockGroupController } from './livestock-group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LivestockGroup,
  LivestockGroupSchema,
} from './entities/livestock-group.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LivestockGroup.name, schema: LivestockGroupSchema },
    ]),
  ],
  controllers: [LivestockGroupController],
  providers: [LivestockGroupService],
})
export class LivestockGroupModule {}
