import { Injectable, BadRequestException, NotFoundException, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository } from 'typeorm';
import { AddArticleDTO, UpdateArticleDTO, FindArticleDTO } from './dto';
import { FileSystemUtils } from 'src/shared/utils/file-system.utils';
import { files } from 'src/configs/storage.config';

@Injectable()
export class ArticleService {

    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,
    ) { }

    async fetchAll(by: FindArticleDTO): Promise<Article[]> {
        return await this.articleRepository.find({ where: by });
    }

    async getByID(id: number): Promise<Article> {
        return await this.articleRepository.findOne({ id });
    }

    async addArticle(article: AddArticleDTO): Promise<Article> {

        const { title } = article;

        const newArticle = Object.assign(new Article(), article);

        return await this.articleRepository.save(newArticle);
    }

    async updateArticle(article: UpdateArticleDTO | Article): Promise<Article> {

        const id: number = article.id;

        const articleFound = await this.articleRepository.findOne({ id });

        if (!articleFound) {
            throw new NotFoundException(`Publicação com ID "${id}" não encontrada`);
        }

        const updatedArticle = Object.assign(articleFound, article);

        return await this.articleRepository.save(updatedArticle);
    }

    async removeArticle(id: number): Promise<Article> {

        const articleFound = await this.articleRepository.findOne({ id });

        if (!articleFound) {
            throw new NotFoundException(`Publicação com ID "${id}" não encontrada`);
        }

        const newArticle = Object.assign(articleFound, {
            status: 'removido'
        });

        return await this.articleRepository.save(newArticle);

    }

    async permanentlyDeleteArticle(id: number): Promise<any> {

        const articleFound = await this.articleRepository.findOne({ id });

        if (!articleFound) {
            throw new NotFoundException(`Publicação com ID "${id}" não encontrada`);
        }

        await this.articleRepository.delete(id);

        const ArticleDeleted = await this.articleRepository.findOne({ id });

        if (ArticleDeleted) {
            return JSON.stringify({
                "message": `Não foi possível deletar a Publicação com ID "${id}"`,
                "type": "error",
            });
        }

        return JSON.stringify({
            "message": "Deletado com sucesso",
            "type": "success",
        });
    }

    async changeThumbnail(id: number, file: string): Promise<Article> {
        const article = await this.getByID(id);
            
        await FileSystemUtils.remove(`./${files.channelThumbnailDirectory}/${article.url_image}`);

        article.url_image =  file;

        return await this.updateArticle(article);
    }
}

