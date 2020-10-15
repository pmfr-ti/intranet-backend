import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { File } from './entities/file.entity';
import { FileAdminController } from './file-admin.controller';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    MulterModule.register(),
    AuthModule
  ],
  controllers: [FileController, FileAdminController],
  providers: [FileService]
})
export class FileModule {}