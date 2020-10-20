import { Controller, Post, Get, Body, Param, Logger, Res, BadRequestException } from '@nestjs/common';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { AppController } from 'src/app.controller';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entity';
import { FindChannelDTO } from './dto';
import { files } from 'src/configs/storage.config';
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

    @Get('thumbnail/:imageUrl')
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getThumbnail(
        @Param('imageUrl', ValidationParametersPipe) imageUrl: string,
        @Res() res
    ): Promise<any> {
        const isValid = await this.channelService.find({ imageUrl: imageUrl });

        if (!isValid) {
            throw new BadRequestException("Requisição inválida");
        }

        return await res.sendFile(imageUrl, { root: files.channelThumbnailDirectory });
    }
}