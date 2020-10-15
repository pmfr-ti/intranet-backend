
import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger, UseGuards, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/app.controller';
import { ArticleService } from './article.service';
import { Article } from './entities/article.entity';
import { AddArticleDTO, FindArticleDTO, UpdateArticleDTO } from './dto';
import { articleThumbnailStorage, files } from 'src/configs/storage.config';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/article')
export class ArticleController {

    private logger = new Logger(AppController.name);

    constructor(private articleService: ArticleService) { }
    
    @Post('list')
    async listArticle(@Body() findArticle: FindArticleDTO): Promise<Article[] | null> {
        if (findArticle) { return await this.articleService.fetchAll(findArticle) }

        return await this.articleService.fetchAll({ status: 'ativo' });
    } 

    @Post('get/:id')
    async getArticle(@Param('id', ValidationParametersPipe) id: number): Promise<Article> {
        return await this.articleService.getByID(id);
    }


    @Get('thumbnail/:id')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getThumbnail(
        @Param('id', ValidationParametersPipe) id: number,
        @Res() res
    ): Promise<any> {
        return await res.sendFile(id, { root: files.articleThumbnailDirectory});
    }
    @Post('admin/upload-thumbnail/:id')
    @UseGuards(JwtAuthGuard)
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('file', articleThumbnailStorage))
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async uploadThumbnail(
        @Param('id', ValidationParametersPipe) id: number,
        @UploadedFile() file
    ): Promise<Article> {

        if (!file || !file.filename) {
            throw new BadRequestException(`Arquivo inválido`);   
        }

        return this.articleService.changeThumbnail(id, file.filename);
    }
}
