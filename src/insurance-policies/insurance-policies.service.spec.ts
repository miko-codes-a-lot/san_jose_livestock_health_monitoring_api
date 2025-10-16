import { Test, TestingModule } from '@nestjs/testing';
import { InsurancePoliciesService } from './insurance-policies.service';

describe('InsurancePoliciesService', () => {
  let service: InsurancePoliciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsurancePoliciesService],
    }).compile();

    service = module.get<InsurancePoliciesService>(InsurancePoliciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
