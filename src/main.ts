import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './shared/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import * as momentTimeZone from 'moment-timezone';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Exception Filter
  // app.useGlobalFilters(new AllExceptionFilter());

  Date.prototype.toJSON = function (): any {
    return momentTimeZone(this).tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss.SSS');
  }

  const port = configService.get('port');

  await app.listen(port);

  console.log(`SERVER IS RUNNING ON PORT ${port}`);
}

bootstrap();
