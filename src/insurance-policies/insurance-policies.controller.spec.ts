import { Test, TestingModule } from '@nestjs/testing';
import { InsurancePoliciesController } from './insurance-policies.controller';
import { InsurancePoliciesService } from './insurance-policies.service';

describe('InsurancePoliciesController', () => {
  let controller: InsurancePoliciesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsurancePoliciesController],
      providers: [InsurancePoliciesService],
    }).compile();

    controller = module.get<InsurancePoliciesController>(InsurancePoliciesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
