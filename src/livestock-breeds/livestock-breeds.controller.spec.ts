import { Test, TestingModule } from '@nestjs/testing';
import { LivestockBreedsController } from './livestock-breeds.controller';
import { LivestockBreedsService } from './livestock-breeds.service';

describe('LivestockBreedsController', () => {
  let controller: LivestockBreedsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivestockBreedsController],
      providers: [LivestockBreedsService],
    }).compile();

    controller = module.get<LivestockBreedsController>(LivestockBreedsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
