import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { AddFileDTO, UpdateFileDTO, FindFileDTO } from './dto';
import { FileSystemUtils } from 'src/shared/utils/file-system.utils';
import { files } from 'src/configs/storage.config';

@Injectable()
export class FileService {
    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
    ) { }

    async fetchAll(by: FindFileDTO): Promise<File[]> {
        return await this.fileRepository.find({ where: by });
    }

    async getByID(id: number): Promise<File>{
        return await this.fileRepository.findOne({ id });
    }

    async addFile(file: AddFileDTO): Promise<File> {

        const newFile = Object.assign(new File(), file);

        return await this.fileRepository.save(newFile);
    }

    async updateFile(file: UpdateFileDTO | File): Promise<File> {
        
        const id: number = file.id;

        const fileFound = await this.fileRepository.findOne({ id });

        if (!fileFound) {
            throw new NotFoundException(`Arquivo com ID "${id}" não encontrado`);
        }

        const updatedFile = Object.assign(fileFound, file);

        return await this.fileRepository.save(updatedFile);
    }

    async removeFile(id: number): Promise<File> {

        const fileFound = await this.fileRepository.findOne({ id });

        if (!fileFound) {
            throw new NotFoundException(`Arquivo com ID "${id}" não encontrado`);
        }

        const newFile = Object.assign(fileFound, {
            status: 'removido'
        });

        return await this.fileRepository.save(newFile);

    }

    async permanentlyDeleteFile(id: number): Promise<any> {

        const fileFound = await this.fileRepository.findOne({ id });

        if (!fileFound) {
            throw new NotFoundException(`Arquivo com ID "${id}" não encontrado`);
        }

        await this.fileRepository.delete(id);

        const FileDeleted = await this.fileRepository.findOne({ id });

        if (FileDeleted) {
            return JSON.stringify({
                "message": `Não foi possível deletar o arquivo com ID "${id}"`,
                "type": 'error',
            });
        }

        await FileSystemUtils.remove(`./${files.attachmentsDirectory}/${fileFound.url}`);

        return JSON.stringify({
            "message": 'Deletado com sucesso',
            "type": "success",
        });
    }

    async changeAttach(id: number, attach: string): Promise<File> {
        const file = await this.getByID(id);
            
        await FileSystemUtils.remove(`./${files.attachmentsDirectory}/${file.url}`);

        file.url =  attach;

        return await this.updateFile(file);
    }
}
