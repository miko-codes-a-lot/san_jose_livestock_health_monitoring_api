import { Test, TestingModule } from '@nestjs/testing';
import { LivestockClassificationsService } from './livestock-classifications.service';

describe('LivestockClassificationsService', () => {
  let service: LivestockClassificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LivestockClassificationsService],
    }).compile();

    service = module.get<LivestockClassificationsService>(
      LivestockClassificationsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
