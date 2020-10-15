import { Test, TestingModule } from '@nestjs/testing';
import { ArticleAdminController } from './article-admin.controller';

describe('ArticleController', () => {
  let controller: ArticleAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleAdminController],
    }).compile();

    controller = module.get<ArticleAdminController>(ArticleAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
