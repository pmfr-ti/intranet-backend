import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Article } from 'src/blog/article/entities/article.entity';
import { Channel } from 'src/blog/channel/entities/channel.entity';
import { Category } from 'src/blog/category/entities/category.entity';

@Entity()
export class Account {

    @PrimaryGeneratedColumn()
    id: number;

    @Column(({ type: 'varchar', width: 255 }))
    username: string;

    @Column(({ type: 'varchar', width: 255, nullable: true }))
    recoveryKey;

    @Column(({ type: 'datetime', nullable: true }))
    lastLoginDate;

    @Column(({ type: "datetime" }))
    createdAt: Date = new Date();

    @Column(({ type: "datetime" }))
    updatedAt: Date = new Date();

    @Column({ default: 'ativo' })
    status: string;

    @OneToMany(type => Channel, channel => channel.account)
    channels: Channel[]

    @OneToMany(type => Category, category => category.account)
    categories: Category[]

    @OneToMany(type => Article, article => article.account)
    articles: Article[]

    async generateRecoveryKey(length = 10): Promise<string> {
        let generatedPassword = '';

        const charPossible = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let i = 0; i < length; i++) {
            generatedPassword += charPossible.charAt(Math.floor(Math.random() * charPossible.length));
        }

        this.recoveryKey = await bcrypt.hash(generatedPassword, 10);

        return generatedPassword;
    }

    async compareRecoveryKey(attempt: string): Promise<any> {
        if (!this.recoveryKey) { return false; }
        return await bcrypt.compare(attempt, this.recoveryKey);
    }

    isActive(): boolean {
        return this.status === 'ativo' ? true : false;
    }

    @BeforeUpdate()
    setUpdatedAt(): void {
        this.updatedAt = new Date();
    }
}
