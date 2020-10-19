import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger, UseGuards, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/app.controller';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entity';
import { AddChannelDTO, UpdateChannelDTO, FindChannelDTO } from './dto';
import { files, channelThumbnailStorage } from 'src/configs/storage.config';
import { ResDTO } from 'src/shared/dto';

@Controller('api/channel')
// @UseGuards(JwtAuthGuard)
export class ChannelController {

    private logger = new Logger(AppController.name);

    constructor(private channelService: ChannelService) { }

    @Post('list')
    async listChannel(@Body() findChannel: FindChannelDTO): Promise<Channel[] | null> {
        if (findChannel) { return await this.channelService.fetchAll(findChannel) }

        return await this.channelService.fetchAll({ status: 'ativo' });
    }

    @Post('get/:id')
    async getChannel(@Param('id', ValidationParametersPipe) id: number): Promise<ResDTO> {
        return await this.channelService.getByID(id);
    }

    @Get('thumbnail/:id')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getThumbnail(
        @Param('id', ValidationParametersPipe) id: number,
        @Res() res
    ): Promise<any> {
        return await res.sendFile(id, { root: files.channelThumbnailDirectory});
    }
}