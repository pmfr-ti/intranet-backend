import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/app.controller';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { AddCategoryDTO, UpdateCategoryDTO, FindCategoryDTO } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { files, categoryThumbnailStorage } from 'src/configs/storage.config';

@Controller('api/category')
export class CategoryController {

    private logger = new Logger(AppController.name);

    constructor(private categoryService: CategoryService) { }

    @Post('list')
    async listCategory(@Body() findCategory: FindCategoryDTO): Promise<Category[] | null> {
        if (findCategory) { return await this.categoryService.fetchAll(findCategory) }

        return await this.categoryService.fetchAll({ status: 'ativo' });
    }

    @Post('get/:id')
    async getCategory(@Param('id', ValidationParametersPipe) id: number): Promise<Category> {
        return await this.categoryService.getByID(id);
    }

    @Get('thumbnail/:id')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getThumbnail(
        @Param('id', ValidationParametersPipe) id: number,
        @Res() res
    ): Promise<any> {
        return await res.sendFile(id, { root: files.categoryThumbnailDirectory});
    }

}
