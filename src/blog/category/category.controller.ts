import { Controller, Post, Get, Body, Param, Logger, Res, BadRequestException } from '@nestjs/common';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { AppController } from 'src/app.controller';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { FindCategoryDTO } from './dto';
import { files } from 'src/configs/storage.config';
import { ResDTO } from 'src/shared/dto';

@Controller('api/category')
// @UseGuards(JwtAuthGuard)
export class CategoryController {

    private logger = new Logger(AppController.name);

    constructor(private categoryService: CategoryService) { }

    @Post('list')
    async listCategory(@Body() findCategory: FindCategoryDTO): Promise<Category[] | null> {
        if (findCategory) { return await this.categoryService.fetchAll(findCategory) }

        return await this.categoryService.fetchAll({ status: 'ativo' });
    }

    @Post('get/:id')
    async getCategory(@Param('id', ValidationParametersPipe) id: number): Promise<ResDTO> {
        return await this.categoryService.getByID(id);
    }

    @Get('thumbnail/:imageUrl')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getThumbnail(
        @Param('imageUrl', ValidationParametersPipe) imageUrl: string,
        @Res() res
    ): Promise<any> {
        const isValid = await this.categoryService.find({ imageUrl: imageUrl });

        if (!isValid) {
            throw new BadRequestException("Requisição inválida");
        }

        return await res.sendFile(imageUrl, { root: files.categoryThumbnailDirectory });
    }
}