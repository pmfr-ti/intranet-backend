import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { Like, Repository } from 'typeorm'
import { AddCategoryDTO, UpdateCategoryDTO, FindCategoryDTO } from './dto'
import { PaginationDTO } from 'src/shared/dto/pagination.dto'
import { FileSystemUtils } from 'src/shared/utils/file-system.utils'
import { files } from 'src/configs/storage.config'
import { ResDTO } from 'src/shared/dto'

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async fetchAll(by: FindCategoryDTO): Promise<Category[]> {
        return await this.categoryRepository.find({ where: by })
    }

    async find(by: FindCategoryDTO): Promise<Category> {
        return await this.categoryRepository.findOne({ where: by })
    }

    async paginate(query: PaginationDTO): Promise<any> {

        const pageSize = query.pageSize || 10
        const skip = query.skip || 0
        const filter = query.filter || ''
        const orderColumn = query.sort.column || 'id'
        const orderValue = query.sort.value.toLocaleLowerCase() === 'asc' ? 1 : -1
        const status = query.status || 'ativo';

        const [data, count] = await this.categoryRepository.findAndCount(
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
        
        const category = await this.categoryRepository.findOne({ id })

        if (!category) {
            return {
                message: 'Canal não encontrado',
                type: 'error'
            };
        }

        return {
            type: 'success',
            message: 'Operação realizada com sucesso',
            data: category
        };


    }

    async addCategory(category: AddCategoryDTO): Promise<ResDTO> {

        const isCategoryFound = await this.categoryRepository.findOne({ title: category.title })

        if (isCategoryFound) {
            return {
                message: `O Canal "${ category.title }" já está cadastrado`,
                type: 'error',
            }
        }

        const categoryToSave = Object.assign(new Category(), category)

        const newCategory = await this.categoryRepository.save(categoryToSave)

        if (!newCategory) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
            }
        }

        return {
            message: 'Adicionado com sucesso',
            type: 'success',
            data: newCategory
        }

    }

    async updateCategory(category: UpdateCategoryDTO | Category): Promise<ResDTO> {

        const categoryFound = await this.categoryRepository.findOne({ id: category.id })

        if (!categoryFound) {
            return {
                message: `Canal com ID "${ category.id }" não encontrado`,
                type: 'error',
            }
        }

        const categoryToSave = Object.assign(categoryFound, category)

        const updatedCategory = await this.categoryRepository.save(categoryToSave)

        if (!updatedCategory) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
                data: updatedCategory
            }
        }

        return {
            message: 'Atualizado com sucesso',
            type: 'success',
            data: updatedCategory
        }
    }

    async removeCategory(id: number, account: number): Promise<ResDTO> {

        const categoryFound = await this.categoryRepository.findOne({ id })

        if (!categoryFound) {
            return {
                message: `Canal com ID "${id}" não encontrado`,
                type: 'error',
            }
        }

        const categoryToSave = Object.assign(categoryFound, {
            status: 'removido',
            account: account
        })

        const updatedCategory = await this.categoryRepository.save(categoryToSave)

        if (!updatedCategory) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
                data: updatedCategory
            }
        }

        return {
            message: 'Removido com sucesso',
            type: 'success',
            data: updatedCategory
        }
    }

    async restoreCategory(id: number, account: number): Promise<ResDTO> {

        const categoryFound = await this.categoryRepository.findOne({ id })

        if (!categoryFound) {
            return {
                message: `Canal com ID "${id}" não encontrado`,
                type: 'error',
            }
        }

        const categoryToSave = Object.assign(categoryFound, {
            status: 'ativo',
            account: account
        })

        const updatedCategory = await this.categoryRepository.save(categoryToSave)

        if (!updatedCategory) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
                data: updatedCategory
            }
        }

        return {
            message: 'Restaurado com sucesso',
            type: 'success',
            data: updatedCategory
        }
    }

    async permanentlyDelete(id: number, account: number): Promise<ResDTO> {

        const categoryFound = await this.categoryRepository.findOne({ id })

        if (!categoryFound) {
            return {
                message: `Canal com ID "${id}" não encontrado`,
                type: 'error',
            }
        }

        await this.categoryRepository.delete(id)

        const CategoryDeleted = await this.categoryRepository.findOne({ id })

        if (CategoryDeleted) {
            return {
                message: `Não foi possível deletar o canal com ID "${id}"`,
                type: 'error',
            }
        }

        await FileSystemUtils.remove(`./${files.categoryThumbnailDirectory}/${categoryFound.imageUrl}`)

        return {
            message: 'Deletado com sucesso',
            type: 'success',
        }
    }

    async changeThumbnail(params: { id: number, file: string, account: number }): Promise<ResDTO> {

        const category = await this.categoryRepository.findOne(params.id);

        if (!category) {
            return {
                message: 'Canal não encontrado',
                type: 'error'
            };
        }

        if (category.imageUrl) {
            await FileSystemUtils.remove(`./${files.categoryThumbnailDirectory}/${category.imageUrl}`)
        }

        const categoryToUpdate: Category = Object.assign(new Category(), {
            id: category.id,
            title: category.title,
            imageUrl: params.file,
            account: params.account
        })

        const updatedCategory = await this.categoryRepository.save(categoryToUpdate)

        if (!updatedCategory) {
            return {
                type: 'error',
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                data: updatedCategory
            }
        }

        return {
            type: 'success',
            message: 'Operação realizada com sucesso',
            data: updatedCategory
        }
    }
}
