import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Channel } from './entities/channel.entity';
import { ChannelController } from './channel-admin.controller';
import { ChannelService } from './channel.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    MulterModule.register(),
    AuthModule
  ],
  controllers: [ChannelController],
  providers: [ChannelService]
})
export class ChannelModule { }
