import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ArticleAdminController } from './article-admin.controller';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Article } from './entities/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    AuthModule
  ],
  controllers: [ArticleController, ArticleAdminController],
  providers: [ArticleService]
})
export class ArticleModule { }
