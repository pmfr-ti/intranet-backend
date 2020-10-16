import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { Like, Repository } from 'typeorm';
import { AddChannelDTO, UpdateChannelDTO, FindChannelDTO } from './dto';
import { PaginationDTO } from 'src/shared/dto/pagination.dto';
import { FileSystemUtils } from 'src/shared/utils/file-system.utils';
import { files } from 'src/configs/storage.config';
import * as moment from 'moment';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
    ) { }

    async fetchAll(by: FindChannelDTO): Promise<Channel[]> {
        return await this.channelRepository.find({ where: by });
    }

    async paginate(query: PaginationDTO): Promise<any> {
        
        const pageSize = query.pageSize || 10
        const skip = query.skip || 0
        const filter = query.filter || ''
        const orderColumn = query.sort.column || 'id';
        const orderValue = query.sort.value.toLocaleLowerCase() === 'asc' ? 1: -1

        const [data, count] = await this.channelRepository.findAndCount(
            {
                where: [
                    { id: Like('%' + filter + '%') },
                    { title: Like('%' + filter + '%') },
                    { imageUrl: Like('%' + filter + '%') },
                    { createdAt: Like('%' + filter + '%') },
                    { updatedAt: Like('%' + filter + '%') },
                ],
                order: { [orderColumn] : orderValue },
                take: pageSize,
                skip: skip
            }
        );

        return { data, count }

    }


    async getByID(id: number): Promise<Channel>{
        return await this.channelRepository.findOne({ id });
    }

    async addChannel(channel: AddChannelDTO): Promise<Channel> {

        const { title } = channel;

        const isChannelFound = await this.channelRepository.findOne({ title });

        if (isChannelFound) {
            throw new BadRequestException(`O Canal "${title}" já está cadastrado`);
        }

        const newChannel = Object.assign(new Channel(), channel);

        return await this.channelRepository.save(newChannel);
    }

    async updateChannel(channel: UpdateChannelDTO): Promise<Channel> {
        
        const id: number = channel.id;

        const channelFound = await this.channelRepository.findOne({ id });

        if (!channelFound) {
            throw new NotFoundException(`Canal com ID "${id}" não encontrado`);
        }

        const updatedChannel = Object.assign(channelFound, channel);

        return await this.channelRepository.save(updatedChannel);
    }

    async removeChannel(id: number): Promise<Channel> {

        const channelFound = await this.channelRepository.findOne({ id });

        if (!channelFound) {
            throw new NotFoundException(`Canal com ID "${id}" não encontrado`);
        }

        const newChannel = Object.assign(channelFound, {
            status: 'removido'
        });

        return await this.channelRepository.save(newChannel);

    }

    async permanentlyDeleteChannel(id: number): Promise<any> {

        const channelFound = await this.channelRepository.findOne({ id });

        if (!channelFound) {
            throw new NotFoundException(`Canal com ID "${id}" não encontrado`);
        }

        await this.channelRepository.delete(id);

        const ChannelDeleted = await this.channelRepository.findOne({ id });

        if (ChannelDeleted) {
            return JSON.stringify({
                message: `Não foi possível deletar o canal com ID "${id}"`,
                type: 'error',
            });
        }

        await FileSystemUtils.remove(`./${files.channelThumbnailDirectory}/${channelFound.imageUrl}`);

        return JSON.stringify({
            message: 'Deletado com sucesso',
            type: 'success',
        });
    }

    async changeThumbnail(id: number, file: string): Promise<Channel> {
        const channel = await this.getByID(id);
            
        await FileSystemUtils.remove(`./${files.channelThumbnailDirectory}/${channel.imageUrl}`);

        channel.imageUrl =  file;

        return await this.updateChannel(channel);
    }
}
