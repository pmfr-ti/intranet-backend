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
export class FileController {

    private logger = new Logger(AppController.name);

    constructor(private fileService: FileService) { }

    @Get('list')
    async listFile(@Body() findFile: FindFileDTO): Promise<File[] | null> {
        if (findFile) { return await this.fileService.fetchAll(findFile) }

        return await this.fileService.fetchAll({ status: 'ativo' });
    }

    @Post('get/:id')
    async getFile(@Param('id', ValidationParametersPipe) id: number): Promise<File> {
        return await this.fileService.getByID(id);
    }

    @Post('thumbnail/:id')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getThumbnail(
        @Param('id', ValidationParametersPipe) id: number,
        @Res() res
    ): Promise<any> {
        return await res.sendFile(id, { root: files.attachmentsDirectory});
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
    async permanentlyDeleteFile(@Param('id', ValidationParametersPipe) id: number): Promise<any> {
        return await this.fileService.permanentlyDeleteFile(id);
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
