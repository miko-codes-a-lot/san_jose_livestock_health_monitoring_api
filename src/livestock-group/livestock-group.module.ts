import { Module } from '@nestjs/common';
import { LivestockGroupService } from './livestock-group.service';
import { LivestockGroupController } from './livestock-group.controller';

@Module({
  controllers: [LivestockGroupController],
  providers: [LivestockGroupService],
})
export class LivestockGroupModule {}
