import { Test, TestingModule } from '@nestjs/testing';
import { MortalityCausesController } from './mortality-causes.controller';
import { MortalityCausesService } from './mortality-causes.service';

describe('MortalityCausesController', () => {
  let controller: MortalityCausesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MortalityCausesController],
      providers: [MortalityCausesService],
    }).compile();

    controller = module.get<MortalityCausesController>(MortalityCausesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
