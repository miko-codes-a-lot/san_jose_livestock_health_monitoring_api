import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/entities/user.entity';
import {
  Livestock,
  LivestockSchema,
} from 'src/livestock/entities/livestock.entity';
import { Claim, ClaimSchema } from 'src/claims/entities/claim.entity';
import {
  HealthRecord,
  HealthRecordSchema,
} from 'src/health-records/entities/health-record.entity';
import {
  InsurancePolicy,
  InsurancePolicySchema,
} from 'src/insurance-policies/entities/insurance-policy.entity';
import {
  LivestockClassification,
  LivestockClassificationSchema,
} from 'src/livestock-classifications/entities/livestock-classification.entity';
import {
  MortalityCause,
  MortalityCauseSchema,
} from 'src/mortality-causes/entities/mortality-cause.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Livestock.name, schema: LivestockSchema },
      { name: Claim.name, schema: ClaimSchema },
      { name: HealthRecord.name, schema: HealthRecordSchema },
      { name: InsurancePolicy.name, schema: InsurancePolicySchema },
      {
        name: LivestockClassification.name,
        schema: LivestockClassificationSchema,
      },
      {
        name: MortalityCause.name,
        schema: MortalityCauseSchema,
      },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
