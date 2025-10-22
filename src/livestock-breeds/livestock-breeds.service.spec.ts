import { Test, TestingModule } from '@nestjs/testing';
import { LivestockBreedsService } from './livestock-breeds.service';

describe('LivestockBreedsService', () => {
  let service: LivestockBreedsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LivestockBreedsService],
    }).compile();

    service = module.get<LivestockBreedsService>(LivestockBreedsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
