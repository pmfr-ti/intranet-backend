
import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger, UseGuards, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/app.controller';
import { ArticleService } from './article.service';
import { Article } from './entities/article.entity';
import { AddArticleDTO, FindArticleDTO, UpdateArticleDTO } from './dto';
import { articleThumbnailStorage, files } from 'src/configs/storage.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDTO, ResDTO } from 'src/shared/dto';
import { User } from 'src/shared/decorators/user.decorator';
import { AuthDTO } from 'src/auth/dto';

@Controller('api/admin/article')
@UseGuards(JwtAuthGuard)
export class ArticleAdminController {

    private logger = new Logger(AppController.name);

    constructor(private articleService: ArticleService) { }

    @Post('paginate')
    async findAllArticle(@Body() searchParams: PaginationDTO): Promise<any | null> {
        return await this.articleService.paginate(searchParams)
    }

    @Post('get/:id')
    async getArticle(@Param('id', ValidationParametersPipe) id: number): Promise<ResDTO> {
        return await this.articleService.getByID(id)
    }

    @Post('add')
    @UsePipes(ValidationPipe)
    async addArticle(
        @User() user: AuthDTO,
        @Body() article: AddArticleDTO,
    ): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        article.account = user.id
        return await this.articleService.addArticle(article)
    }

    @Post('update')
    @UsePipes(ValidationPipe)
    async updateArticle(
        @User() user: AuthDTO,
        @Body() article: UpdateArticleDTO
    ): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        article.account = user.id
        return await this.articleService.updateArticle(article)
    }

    @Post('remove/:id')
    async removeArticle(
        @User() user: AuthDTO,
        @Param('id', ValidationParametersPipe
        ) id: number): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        return await this.articleService.removeArticle(id, user.id)
    }

    @Post('restore/:id')
    async restoreArticle(
        @User() user: AuthDTO,
        @Param('id', ValidationParametersPipe
        ) id: number): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        return await this.articleService.restoreArticle(id, user.id)
    }

    @Post('delete/:id')
    async permanentlyDelete(
        @User() user: AuthDTO,
        @Param('id', ValidationParametersPipe) id: number
    ): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        return await this.articleService.permanentlyDelete(id, user.id)
    }

    @Post('upload-thumbnail')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('file', articleThumbnailStorage))
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async uploadThumbnail(
        @User() user: AuthDTO,
        @UploadedFile() file,
        @Body() body: any
    ): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        if (!file || !file.filename || !body.id) { throw new BadRequestException(`Arquivo inválido`) }

        return this.articleService.changeThumbnail({
            id: body.id,
            file: file.filename,
            account: user.id
        })
    }
}
