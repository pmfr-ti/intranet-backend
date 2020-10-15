import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryAdminController } from './category-admin.controller';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    AuthModule
  ],
  controllers: [CategoryController, CategoryAdminController],
  providers: [CategoryService]
})
export class CategoryModule { }
