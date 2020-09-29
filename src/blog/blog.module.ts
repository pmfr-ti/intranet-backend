import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ChannelModule } from './channel/channel.module';
import { FileModule } from './file/file.module';
import { ArticleModule } from './article/article.module';

@Module({
    imports: [
        ChannelModule,
        CategoryModule,
        FileModule,
        ArticleModule,
    ]
})
export class BlogModule {}
