import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const authProviders = [
    JwtModule.registerAsync({
        imports: [ConfigModule.forRoot()],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
            secret: configService.get('jwtKey'),
            signOptions: {
                expiresIn: `${configService.get('jwtExpirationTime')}s`
            }
        })
    }),
];
