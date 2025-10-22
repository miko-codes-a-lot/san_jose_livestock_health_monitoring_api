import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MortalityCause,
  MortalityCauseSchema,
} from './entities/mortality-cause.entity';
import { MortalityCauseController } from './mortality-causes.controller';
import { MortalityCauseService } from './mortality-causes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MortalityCause.name,
        schema: MortalityCauseSchema,
      },
    ]),
  ],
  controllers: [MortalityCauseController],
  providers: [MortalityCauseService],
})
export class MortalityCausesModule {}
