import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';

export const MailModule = MailerModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (config: ConfigService) => ({
        template: {
            dir: path.resolve(__dirname, '..', '..', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
                extName: '.hbs',
                layoutsDir: path.resolve(__dirname, '..', '..', 'templates'),
            },
        },
        transport: {
            secure: false,
            host: config.get('mailerConfig')['host'],
            port: config.get('mailerConfig')['port'],
            auth: {
                user: config.get('mailerConfig')['user'],
                pass: config.get('mailerConfig')['pass']
            }
        }
    }),
    inject: [ConfigService],
})
