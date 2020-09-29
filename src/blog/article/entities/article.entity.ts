import { Account } from 'src/accounts/entities/account.entity';
import { Category } from 'src/blog/category/entities/category.entity';
import { Channel } from 'src/blog/channel/entities/channel.entity';
import { File } from 'src/blog/file/entities/file.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Article {

    @PrimaryGeneratedColumn()
    id: number;

    @Column(({ type: 'varchar', width: 80 }))
    title: string;

    @Column(({ type: 'varchar', width: 200 }))
    summary: string;

    @Column(({ type: 'mediumtext'}))
    content: string;

    @Column(({ type: 'varchar', width: 2048 }))
    url_image;

    @Column(({ type: "date" }))
    dateStart: Date = new Date;

    @Column(({ type: "date", default: null }))
    dateEnd: Date;

    @Column(({ type: 'longtext' }))
    tags: string[];

    @Column(({ type: 'tinyint' }))
    featured = false;

    @ManyToOne(type => Account, account => account.articles)
    account: Account;

    @ManyToOne(type => Channel, channel => channel.articles)
    channel: Channel;

    @ManyToOne(type => Category, category => category.articles)
    category: Category;

    @Column({ default: 'ativo' })    
    status: string;

    @Column(({ type: "datetime" }))
    createdAt: Date = new Date();

    @Column(({ type: "datetime" }))
    updatedAt: Date = new Date();

    @OneToMany(type => File, file => file.article)
    files: File[]
}

