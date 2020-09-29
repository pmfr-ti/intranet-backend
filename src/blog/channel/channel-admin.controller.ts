import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger, UseGuards, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/app.controller';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entity';
import { AddChannelDTO, UpdateChannelDTO, FindChannelDTO } from './dto';
import { files, channelThumbnailStorage } from 'src/configs/storage.config';

@Controller('api/admin/channel')
@UseGuards(JwtAuthGuard)
export class ChannelController {

    private logger = new Logger(AppController.name);

    constructor(private channelService: ChannelService) { }

    @Get('list')
    async listChannel(@Body() findChannel: FindChannelDTO): Promise<Channel[] | null> {
        if (findChannel) { return await this.channelService.fetchAll(findChannel) }

        return await this.channelService.fetchAll({ status: 'ativo' });
    }

    @Post('get/:id')
    async getChannel(@Param('id', ValidationParametersPipe) id: number): Promise<Channel> {
        return await this.channelService.getByID(id);
    }

    @Post('thumbnail/:id')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getThumbnail(
        @Param('id', ValidationParametersPipe) id: number,
        @Res() res
    ): Promise<any> {
        return await res.sendFile(id, { root: files.channelThumbnailDirectory});
    }

    @Post('add')
    @UsePipes(ValidationPipe)
    async addChannel(
        @Body() channel: AddChannelDTO,
    ): Promise<Channel | null> {
        return await this.channelService.addChannel(channel);
    }

    @Post('update')
    @UsePipes(ValidationPipe)
    async updateChannel(
        @Body() channel: UpdateChannelDTO
    ): Promise<Channel> {

        return await this.channelService.updateChannel(channel);
    }

    @Post('remove/:id')
    async removeChannel(@Param('id', ValidationParametersPipe) id: number): Promise<any> {
        return await this.channelService.removeChannel(id);
    }

    @Post('delete/:id')
    async permanentlyDeleteChannel(@Param('id', ValidationParametersPipe) id: number): Promise<any> {
        return await this.channelService.permanentlyDeleteChannel(id);
    }

    @Post('upload-thumbnail/:id')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('file', channelThumbnailStorage))
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async uploadThumbnail(
        @Param('id', ValidationParametersPipe) id: number,
        @UploadedFile() file
    ): Promise<Channel> {

        if (!file || !file.filename) {
            throw new BadRequestException(`Arquivo inválido`);   
        }

        return this.channelService.changeThumbnail(id, file.filename);
    }
}