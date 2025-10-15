import { Test, TestingModule } from '@nestjs/testing';
import { LivestockGroupController } from './livestock-group.controller';
import { LivestockGroupService } from './livestock-group.service';

describe('LivestockGroupController', () => {
  let controller: LivestockGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivestockGroupController],
      providers: [LivestockGroupService],
    }).compile();

    controller = module.get<LivestockGroupController>(LivestockGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
