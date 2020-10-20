import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger, UseGuards, UseInterceptors, UploadedFile, Res, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe'
import { JwtAuthGuard } from 'src/auth/guards/auth.guard'
import { AppController } from 'src/app.controller'
import { CategoryService } from './category.service'
import { AddCategoryDTO, UpdateCategoryDTO } from './dto'
import { categoryThumbnailStorage } from 'src/configs/storage.config'
import { PaginationDTO, ResDTO } from 'src/shared/dto'
import { User } from 'src/shared/decorators/user.decorator'
import { AuthDTO } from 'src/auth/dto'

@Controller('api/admin/category')
@UseGuards(JwtAuthGuard)
export class CategoryAdminController {

    private logger = new Logger(AppController.name)

    constructor(private categoryService: CategoryService) { }

    @Post('paginate')
    async findAllCategory(@Body() searchParams: PaginationDTO): Promise<any | null> {
        return await this.categoryService.paginate(searchParams)
    }

    @Post('get/:id')
    async getCategory(@Param('id', ValidationParametersPipe) id: number): Promise<ResDTO> {
        return await this.categoryService.getByID(id)
    }

    @Post('add')
    @UsePipes(ValidationPipe)
    async addCategory(
        @User() user: AuthDTO,
        @Body() category: AddCategoryDTO,
    ): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        category.account = user.id
        return await this.categoryService.addCategory(category)
    }

    @Post('update')
    @UsePipes(ValidationPipe)
    async updateCategory(
        @User() user: AuthDTO,
        @Body() category: UpdateCategoryDTO
    ): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        category.account = user.id
        return await this.categoryService.updateCategory(category)
    }

    @Post('remove/:id')
    async removeCategory(
        @User() user: AuthDTO,
        @Param('id', ValidationParametersPipe
        ) id: number): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        return await this.categoryService.removeCategory(id, user.id)
    }

    @Post('restore/:id')
    async restoreCategory(
        @User() user: AuthDTO,
        @Param('id', ValidationParametersPipe
        ) id: number): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        return await this.categoryService.restoreCategory(id, user.id)
    }

    @Post('delete/:id')
    async permanentlyDelete(
        @User() user: AuthDTO,
        @Param('id', ValidationParametersPipe) id: number
    ): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        return await this.categoryService.permanentlyDelete(id, user.id)
    }

    @Post('upload-thumbnail')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('file', categoryThumbnailStorage))
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async uploadThumbnail(
        @User() user: AuthDTO,
        @UploadedFile() file,
        @Body() body: any
    ): Promise<ResDTO> {

        if (!user) { throw new BadRequestException(`Id da conta inválida ou não fornecida`) }

        if (!file || !file.filename || !body.id) { throw new BadRequestException(`Arquivo inválido`) }

        return this.categoryService.changeThumbnail({
            id: body.id,
            file: file.filename,
            account: user.id
        })
    }
}
