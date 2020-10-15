import { Test, TestingModule } from '@nestjs/testing';
import { ChannelAdminController } from './channel-admin.controller';

describe('Channel Controller', () => {
  let controller: ChannelAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelAdminController],
    }).compile();

    controller = module.get<ChannelAdminController>(ChannelAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
