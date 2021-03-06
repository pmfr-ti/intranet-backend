import { Test, TestingModule } from '@nestjs/testing';
import { FileAdminController } from './file-admin.controller';

describe('FileAdminController', () => {
  let controller: FileAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileAdminController],
    }).compile();

    controller = module.get<FileAdminController>(FileAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
