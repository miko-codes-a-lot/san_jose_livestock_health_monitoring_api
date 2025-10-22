import { Test, TestingModule } from '@nestjs/testing';
import { MortalityCauseService } from './mortality-causes.service';

describe('MortalityCausesService', () => {
  let service: MortalityCauseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MortalityCauseService],
    }).compile();

    service = module.get<MortalityCauseService>(MortalityCauseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
