import { Article } from 'src/blog/article/entities/article.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Channel {

    @PrimaryGeneratedColumn()
    id: number;

    @Column(({ type: 'varchar', width: 50 }))
    title: string;

    @Column(({ type: 'varchar', width: 2048 }))
    url_image;

    @Column({ default: 'ativo' })
    status: string;

    @Column(({ type: "datetime" }))
    createdAt: Date = new Date();

    @Column(({ type: "datetime" }))
    updatedAt: Date = new Date();

    @OneToMany(type => Article, article => article.channel)
    articles: Article[]

}
