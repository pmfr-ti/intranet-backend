import { Injectable, BadRequestException, NotFoundException, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { In, Like, Repository } from 'typeorm';
import { AddArticleDTO, UpdateArticleDTO, FindArticleDTO } from './dto';
import { FileSystemUtils } from 'src/shared/utils/file-system.utils';
import { files } from 'src/configs/storage.config';
import { PaginationDTO, ResDTO } from 'src/shared/dto';

@Injectable()
export class ArticleService {

    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,
    ) { }

    async fetchAll(by: FindArticleDTO): Promise<Article[]> {
        return await this.articleRepository.find({ where: by });
    }

    async find(by: FindArticleDTO): Promise<Article> {
        return await this.articleRepository.findOne({ where: by });
    }

    async paginate(query: PaginationDTO): Promise<any> {

        const pageSize = query.pageSize || 10
        const skip = query.skip || 0
        const filter = query.filter || ''
        const orderColumn = query.sort.column || 'id'
        const orderValue = query.sort.value.toLocaleLowerCase() === 'asc' ? 1 : -1
        const status = query.status || 'ativo';

        const [data, count] = await this.articleRepository.findAndCount(
            {
                where: [
                    { id: Like('%' + filter + '%'), status: status },
                    { title: Like('%' + filter + '%'), status: status },
                    { summary: Like('%' + filter + '%'), status: status },
                    { content: Like('%' + filter + '%'), status: status },
                    { tags: In([filter]), status: status },
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
        const article = await this.articleRepository.findOne({ id })

        if (!article) {
            return {
                message: 'Publicação não encontrada',
                type: 'error'
            };
        }

        return {
            type: 'success',
            message: 'Operação realizada com sucesso',
            data: article
        };
    }

    async addArticle(article: AddArticleDTO): Promise<ResDTO> {

        const articleToSave = Object.assign(new Article(), article);

        const newArticle = await this.articleRepository.save(articleToSave);

        if (!newArticle) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
            }
        }

        return {
            message: 'Adicionado com sucesso',
            type: 'success',
            data: newArticle
        }
    }

    async updateArticle(article: UpdateArticleDTO | Article): Promise<ResDTO> {

        const id: number = article.id;

        const articleFound = await this.articleRepository.findOne({ id });

        if (!articleFound) {
            throw new NotFoundException(`Publicação com ID "${id}" não encontrada`);
        }

        const articleToSave = Object.assign(articleFound, article);

        const updatedArticle = await this.articleRepository.save(articleToSave);

        if (!updatedArticle) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
            }
        }

        return {
            message: 'Atualizado com sucesso',
            type: 'success',
            data: updatedArticle
        }
    }

    async removeArticle(id: number, account: number): Promise<ResDTO> {

        const articleFound = await this.articleRepository.findOne({ id });

        if (!articleFound) {
            throw new NotFoundException(`Publicação com ID "${id}" não encontrada`);
        }

        const articleToSave = Object.assign(articleFound, {
            status: 'removido',
            account: account
        })

        const updatedArticle = await this.articleRepository.save(articleToSave)

        if (!updatedArticle) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
            }
        }

        return {
            message: 'Removido com sucesso',
            type: 'success',
            data: updatedArticle
        }

    }

    async restoreArticle(id: number, account: number): Promise<ResDTO> {

        const articleFound = await this.articleRepository.findOne({ id });

        if (!articleFound) {
            throw new NotFoundException(`Publicação com ID "${id}" não encontrada`);
        }

        const articleToSave = Object.assign(articleFound, {
            status: 'ativo',
            account: account
        })

        const updatedArticle = await this.articleRepository.save(articleToSave)

        if (!updatedArticle) {
            return {
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                type: 'error',
            }
        }

        return {
            message: 'Restaurado com sucesso',
            type: 'success',
            data: updatedArticle
        }
    }

    async permanentlyDelete(id: number, account: number): Promise<ResDTO> {

        const articleFound = await this.articleRepository.findOne({ id })

        if (!articleFound) {
            return {
                message: `Registro com ID "${id}" não encontrado`,
                type: 'error',
            }
        }

        await this.articleRepository.delete(id)

        const articleDeleted = await this.articleRepository.findOne({ id })

        if (articleDeleted) {
            return {
                message: `Não foi possível deletar o registro com ID "${id}"`,
                type: 'error',
            }
        }

        await FileSystemUtils.remove(`./${files.articleThumbnailDirectory}/${articleFound.imageUrl}`)

        return {
            message: 'Deletado com sucesso',
            type: 'success',
        }
    }

    async changeThumbnail(params: { id: number, file: string, account: number }): Promise<ResDTO> {

        const article = await this.articleRepository.findOne(params.id);

        if (!article) {
            return {
                message: 'Registro não encontrado',
                type: 'error'
            };
        }

        if (article.imageUrl) {
            await FileSystemUtils.remove(`./${files.articleThumbnailDirectory}/${article.imageUrl}`)
        }

        const articleToSave: Article = Object.assign(new Article(), {
            id: article.id,
            title: article.title,
            imageUrl: params.file,
            account: params.account
        })

        const updatedArticle = await this.articleRepository.save(articleToSave)

        if (!updatedArticle) {
            return {
                type: 'error',
                message: 'Não foi possível realizar essa operação. Tente novamente mais tarde',
                data: updatedArticle
            }
        }

        return {
            type: 'success',
            message: 'Operação realizada com sucesso',
            data: updatedArticle
        }
    }
}

