import { Test, TestingModule } from '@nestjs/testing';
import { LivestockClassificationsController } from './livestock-classifications.controller';
import { LivestockClassificationsService } from './livestock-classifications.service';

describe('LivestockClassificationsController', () => {
  let controller: LivestockClassificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivestockClassificationsController],
      providers: [LivestockClassificationsService],
    }).compile();

    controller = module.get<LivestockClassificationsController>(
      LivestockClassificationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
