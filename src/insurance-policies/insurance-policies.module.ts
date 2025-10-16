import { Module } from '@nestjs/common';
import { InsurancePolicyController } from './insurance-policies.controller';
import { InsurancePolicyService } from './insurance-policies.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InsurancePolicy,
  InsurancePolicySchema,
} from './entities/insurance-policy.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InsurancePolicy.name, schema: InsurancePolicySchema },
    ]),
  ],
  controllers: [InsurancePolicyController],
  providers: [InsurancePolicyService],
})
export class InsurancePoliciesModule {}
