import { Article } from 'src/blog/article/entities/article.entity';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, BeforeUpdate } from 'typeorm';

@Entity()
export class File {

    @PrimaryGeneratedColumn()
    id: number;

    @Column(({ type: 'varchar', width: 2048 }))
    url: string;

    @Column(({ type: 'varchar', width: 255 }))
    name: string;

    @Column(({ type: 'varchar', width: 400 }))
    description: string;

    @Column(({ type: 'int' }))
    size: number;

    @Column({ default: 'ativo' })
    status: string;

    @Column(({ type: "datetime" }))
    createdAt: Date = new Date();

    @Column(({ type: "datetime" }))
    updatedAt: Date = new Date();

    @ManyToOne(type => Article, article => article.files)
    article: Article;

    @BeforeUpdate()
    setUpdatedAt(): void {
        this.updatedAt = new Date();
    }

}
