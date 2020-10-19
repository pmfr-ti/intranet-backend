import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, Logger, UseGuards, UseInterceptors, UploadedFile, Res, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationParametersPipe } from 'src/shared/pipes/validation-parameters.pipe';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AppController } from 'src/app.controller';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entity';
import { AddChannelDTO, UpdateChannelDTO, FindChannelDTO } from './dto';
import { channelThumbnailStorage } from 'src/configs/storage.config';
import { PaginationDTO, ResDTO } from 'src/shared/dto';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('api/admin/channel')
@UseGuards(JwtAuthGuard)
export class ChannelAdminController {

    private logger = new Logger(AppController.name);

    constructor(private channelService: ChannelService) { }

    @Post('list')
    async listChannel(
        @Body() findChannel: FindChannelDTO
    ): Promise<Channel[] | null> {
        if (findChannel) { return await this.channelService.fetchAll(findChannel) }

        return await this.channelService.fetchAll({ status: 'ativo' });
    }

    @Post('paginate')
    async findAllChannel(@Body() searchParams: PaginationDTO): Promise<any | null> {
        return await this.channelService.paginate(searchParams);
    }

    @Post('get/:id')
    async getChannel(@Param('id', ValidationParametersPipe) id: number): Promise<ResDTO> {
        return await this.channelService.getByID(id);
    }

    @Post('add')
    @UsePipes(ValidationPipe)
    async addChannel(
        @User() user: any,
        @Body() channel: AddChannelDTO,
    ): Promise<ResDTO> {
        if (!user) {
            throw new BadRequestException(`Id da conta inválida ou não fornecida`);
        }
        channel.account = user.id;
        return await this.channelService.addChannel(channel);

    }

    @Post('update')
    @UsePipes(ValidationPipe)
    async updateChannel(
        @User() user: any,
        @Body() channel: UpdateChannelDTO
    ): Promise<ResDTO> {
        if (!user) {
            throw new BadRequestException(`Id da conta inválida ou não fornecida`);
        }
        channel.account = user.id;
        return await this.channelService.updateChannel(channel);
    }

    @Post('remove/:id')
    async removeChannel(
        @User() user: any,
        @Param('id', ValidationParametersPipe
        ) id: number): Promise<ResDTO> {
        if (!user) {
            throw new BadRequestException(`Id da conta inválida ou não fornecida`);
        }
        return await this.channelService.removeChannel(id, user.id);
    }

    @Post('delete/:id')
    async permanentlyDeleteChannel(
        @User() user: any,
        @Param('id', ValidationParametersPipe) id: number
    ): Promise<ResDTO> {

        if (!user) {
            throw new BadRequestException(`Id da conta inválida ou não fornecida`);
        }

        return await this.channelService.permanentlyDeleteChannel(id, user.id);
    }

    @Post('upload-thumbnail')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('file', channelThumbnailStorage))
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async uploadThumbnail(
        @User() user: any,
        @UploadedFile() file,
        @Body() body: any
    ): Promise<ResDTO> {

        if (!user) {
            throw new BadRequestException(`Id da conta inválida ou não fornecida`);
        }

        if (!file || !file.filename || !body.id) {
            throw new BadRequestException(`Arquivo inválido`);
        }

        return this.channelService.changeThumbnail({
            id: body.id,
            file: file.filename,
            account: user.id
        });
    }
}