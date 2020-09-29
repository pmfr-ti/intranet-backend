import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { AddCategoryDTO, UpdateCategoryDTO, FindCategoryDTO } from './dto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async fetchAll(by: FindCategoryDTO): Promise<Category[]> {
        return await this.categoryRepository.find({ where: by });
    }

    async getByID(id: number): Promise<Category>{
        return await this.categoryRepository.findOne({ id });
    }

    async addCategory(category: AddCategoryDTO): Promise<Category> {

        const { title } = category;

        const isCategoryFound = await this.categoryRepository.findOne({ title });

        if (isCategoryFound) {
            throw new BadRequestException(`A Categoria "${title}" já está cadastrada`);
        }

        const newCategory = Object.assign(new Category(), category);

        return await this.categoryRepository.save(newCategory);
    }

    async updateCategory(category: UpdateCategoryDTO): Promise<Category> {
        
        const id: number = category.id;

        const categoryFound = await this.categoryRepository.findOne({ id });

        if (!categoryFound) {
            throw new NotFoundException(`Categoria com ID "${id}" não encontrada`);
        }

        const updatedCategory = Object.assign(categoryFound, category);

        return await this.categoryRepository.save(updatedCategory);
    }

    async removeCategory(id: number): Promise<Category> {

        const categoryFound = await this.categoryRepository.findOne({ id });

        if (!categoryFound) {
            throw new NotFoundException(`Categoria com ID "${id}" não encontrada`);
        }

        const newCategory = Object.assign(categoryFound, {
            status: 'removido'
        });

        return await this.categoryRepository.save(newCategory);

    }

    async permanentlyDeleteCategory(id: number): Promise<any> {

        const categoryFound = await this.categoryRepository.findOne({ id });

        if (!categoryFound) {
            throw new NotFoundException(`Categoria com ID "${id}" não encontrada`);
        }

        await this.categoryRepository.delete(id);

        const CategoryDeleted = await this.categoryRepository.findOne({ id });

        if (CategoryDeleted) {
            return JSON.stringify({
                "message": `Não foi possível deletar a categoria com ID "${id}"`,
                "type": "error",
            });
        }

        return JSON.stringify({
            "message": "Deletado com sucesso",
            "type": "success",
        });
    }
}
