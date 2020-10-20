import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Channel } from './entities/channel.entity'
import { Like, Repository } from 'typeorm'
import { AddChannelDTO, UpdateChannelDTO, FindChannelDTO } from './dto'
import { PaginationDTO } from 'src/shared/dto/pagination.dto'
import { FileSystemUtils } from 'src/shared/utils/file-system.utils'
import { files } from 'src/configs/storage.config'
import { ResDTO } from 'src/shared/dto'

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
    ) { }

    async fetchAll(by: FindChannelDTO): Promise<Channel[]> {
        return await this.channelRepository.find({ where: by })
    }

    async find(by: FindChannelDTO): Promise<Channel> {
        return await this.channelRepository.findOne({ where: by })
    }

    async paginate(query: PaginationDTO): Promise<any> {

        const pageSize = query.pageSize || 10
        const skip = query.skip || 0
        const filter = query.filter || ''
        const orderColumn = query.sort.column || 'id'
        const orderValue = query.sort.value.toLocaleLowerCase() === 'asc' ? 1 : -1
        const status = query.status || 'ativo';

        const [data, count] = await this.channelRepository.findAndCount(
            {
                where: [
                    { id: Like('%' + filter + '%'), status: status },
                    { title: Like('%' + filter + '%'), status: status },
                    { imageUrl: Like('%' + filter + '%'), status: status },
                    { createdAt: Like('%' + filter + '%'), status: status },
                    { updatedAt: Like('%' + filter + '%'), status: status }
                ],
                order: { [orderColumn]: orderValue },
                take: pageSize,
                skip: skip
            }
        )

        return { data, count }
    }

    async getByID(id: number): Promise<ResDTO> {
        
        const channel = await this.channelRepository.findOne({ id })

        if (!channel) {
            return {
                message: 'Canal não encontrado',
                type: 'error'
            };
        }

        return {
            type: 'success',
            message: 'Operação realizada com sucesso',
            data: channel
        };


    }

    async addChannel(channel: AddChannelDTO): Promise<ResDTO> {

        const isChannelFound = await this.channelRepository.findOne({ title: channel.title })

        if (isChannelFound) {
            return {
                message: `O Canal "${ channel.title }" já está cadastrado`,
                type: 'error',
            }
        }

        const channelToSave = Object.assign(new Channel(), channel)

        const newChannel = await this.channelRepository.save(channelToSave)

        if (!newChannel) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
            }
        }

        return {
            message: 'Adicionado com sucesso',
            type: 'success',
            data: newChannel
        }

    }

    async updateChannel(channel: UpdateChannelDTO | Channel): Promise<ResDTO> {

        const channelFound = await this.channelRepository.findOne({ id: channel.id })

        if (!channelFound) {
            return {
                message: `Canal com ID "${ channel.id }" não encontrado`,
                type: 'error',
            }
        }

        const channelToSave = Object.assign(channelFound, channel)

        const updatedChannel = await this.channelRepository.save(channelToSave)

        if (!updatedChannel) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
                data: updatedChannel
            }
        }

        return {
            message: 'Atualizado com sucesso',
            type: 'success',
            data: updatedChannel
        }
    }

    async removeChannel(id: number, account: number): Promise<ResDTO> {

        const channelFound = await this.channelRepository.findOne({ id })

        if (!channelFound) {
            return {
                message: `Canal com ID "${id}" não encontrado`,
                type: 'error',
            }
        }

        const channelToSave = Object.assign(channelFound, {
            status: 'removido',
            account: account
        })

        const updatedChannel = await this.channelRepository.save(channelToSave)

        if (!updatedChannel) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
                data: updatedChannel
            }
        }

        return {
            message: 'Removido com sucesso',
            type: 'success',
            data: updatedChannel
        }
    }

    async restoreChannel(id: number, account: number): Promise<ResDTO> {

        const channelFound = await this.channelRepository.findOne({ id })

        if (!channelFound) {
            return {
                message: `Canal com ID "${id}" não encontrado`,
                type: 'error',
            }
        }

        const channelToSave = Object.assign(channelFound, {
            status: 'ativo',
            account: account
        })

        const updatedChannel = await this.channelRepository.save(channelToSave)

        if (!updatedChannel) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
                data: updatedChannel
            }
        }

        return {
            message: 'Restaurado com sucesso',
            type: 'success',
            data: updatedChannel
        }
    }

    async permanentlyDelete(id: number, account: number): Promise<ResDTO> {

        const channelFound = await this.channelRepository.findOne({ id })

        if (!channelFound) {
            return {
                message: `Canal com ID "${id}" não encontrado`,
                type: 'error',
            }
        }

        await this.channelRepository.delete(id)

        const ChannelDeleted = await this.channelRepository.findOne({ id })

        if (ChannelDeleted) {
            return {
                message: `Não foi possível deletar o canal com ID "${id}"`,
                type: 'error',
            }
        }

        await FileSystemUtils.remove(`./${files.channelThumbnailDirectory}/${channelFound.imageUrl}`)

        return {
            message: 'Deletado com sucesso',
            type: 'success',
        }
    }

    async changeThumbnail(params: { id: number, file: string, account: number }): Promise<ResDTO> {

        const channel = await this.channelRepository.findOne(params.id);

        if (!channel) {
            return {
                message: 'Canal não encontrado',
                type: 'error'
            };
        }

        if (channel.imageUrl) {
            await FileSystemUtils.remove(`./${files.channelThumbnailDirectory}/${channel.imageUrl}`)
        }

        const channelToUpdate: Channel = Object.assign(new Channel(), {
            id: channel.id,
            title: channel.title,
            imageUrl: params.file,
            account: params.account
        })

        const updatedChannel = await this.channelRepository.save(channelToUpdate)

        if (!updatedChannel) {
            return {
                type: 'error',
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                data: updatedChannel
            }
        }

        return {
            type: 'success',
            message: 'Operação realizada com sucesso',
            data: updatedChannel
        }
    }
}
