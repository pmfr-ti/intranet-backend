import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger, UseGuards, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/app.controller';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { AddFileDTO, UpdateFileDTO, FindFileDTO } from './dto';
import { files, fileStorage } from 'src/configs/storage.config';

@Controller('api/file')
@UseGuards(JwtAuthGuard)
export class FileController {

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

    @Get('thumbnail/:id')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getThumbnail(
        @Param('id', ValidationParametersPipe) id: number,
        @Res() res
    ): Promise<any> {
        return await res.sendFile(id, { root: files.attachmentsDirectory });
    }

}
