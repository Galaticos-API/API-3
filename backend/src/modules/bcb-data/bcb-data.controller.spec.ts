import { Test, TestingModule } from '@nestjs/testing';
import { BcbDataController } from './bcb-data.controller';

describe('BcbDataController', () => {
  let controller: BcbDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BcbDataController],
    }).compile();

    controller = module.get<BcbDataController>(BcbDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
