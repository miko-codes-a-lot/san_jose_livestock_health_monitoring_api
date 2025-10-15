import { Test, TestingModule } from '@nestjs/testing';
import { LivestockGroupService } from './livestock-group.service';

describe('LivestockGroupService', () => {
  let service: LivestockGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LivestockGroupService],
    }).compile();

    service = module.get<LivestockGroupService>(LivestockGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
