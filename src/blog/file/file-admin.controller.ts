import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger, UseGuards, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/app.controller';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { AddFileDTO, UpdateFileDTO, FindFileDTO } from './dto';
import { files, fileStorage } from 'src/configs/storage.config';

@Controller('api/admin/file')
@UseGuards(JwtAuthGuard)
export class FileAdminController {

    private logger = new Logger(AppController.name);

    constructor(private fileService: FileService) { }

    @Post('list')
    async listFile(@Body() findFile: FindFileDTO): Promise<File[] | null> {
        if (findFile) { return await this.fileService.fetchAll(findFile) }

        return await this.fileService.fetchAll({ status: 'ativo' });
    }

    @Post('get/:id')
    async getFile(@Param('id', ValidationParametersPipe) id: number): Promise<File> {
        return await this.fileService.getByID(id);
    }

    @Post('add')
    @UsePipes(ValidationPipe)
    async addFile(
        @Body() file: AddFileDTO,
    ): Promise<File | null> {
        return await this.fileService.addFile(file);
    }

    @Post('update')
    @UsePipes(ValidationPipe)
    async updateFile(
        @Body() file: UpdateFileDTO
    ): Promise<File> {

        return await this.fileService.updateFile(file);
    }

    @Post('remove/:id')
    async removeFile(@Param('id', ValidationParametersPipe) id: number): Promise<any> {
        return await this.fileService.removeFile(id);
    }

    @Post('delete/:id')
    async permanentlyDelete(@Param('id', ValidationParametersPipe) id: number): Promise<any> {
        return await this.fileService.permanentlyDelete(id);
    }

    @Post('upload-attach/:id')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('file', fileStorage))
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async uploadThumbnail(
        @Param('id', ValidationParametersPipe) id: number,
        @UploadedFile() file
    ): Promise<File> {

        if (!file || !file.filename) {
            throw new BadRequestException(`Arquivo inválido`);   
        }

        return this.fileService.changeAttach(id, file.filename);
    }
}
