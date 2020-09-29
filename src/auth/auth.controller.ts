import { Controller, Logger, Post, UsePipes, ValidationPipe, Body, UseGuards, Headers } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AuthService } from './auth.service';
import { CredentialsDTO, AuthDTO, RecoveryCredentialsDTO } from './dto';

@Controller('api/auth')
export class AuthController {

    private logger = new Logger(AppController.name);

    constructor(private authService: AuthService) { }

    @Post('login')
    @UsePipes(ValidationPipe)
    async login(@Body() credentialsDTO: CredentialsDTO): Promise<string> {
        return await this.authService.login(credentialsDTO);
    }

    @Post('refresh-token')
    @UsePipes(ValidationPipe)
    async refreshToken(@Headers() headers: { authorization: string }): Promise<string> {
        const token: string = this.authService.extractJWT(headers.authorization);
        return await this.authService.refresh(token);
    }

    @Post('verify-token')
    @UsePipes(ValidationPipe)
    async verifyToken(@Headers() headers: { authorization: string }): Promise<string> {
        const token: string = this.authService.extractJWT(headers.authorization);
        return await this.authService.verify(token);
    }

    @Post('send-recovery-key')
    @UsePipes(ValidationPipe)
    async sendRecoveryKey(@Body() credentialsDTO: Partial<CredentialsDTO>): Promise<any> {
        return await this.authService.sendRecoveryKey(credentialsDTO.username);
    }
    
    @Post('login-recovery-key')
    @UsePipes(ValidationPipe)
    async loginRecoveryKey(@Body() recoveryCredentialsDTO: RecoveryCredentialsDTO): Promise<any> {
        return await this.authService.loginRecoveryKey(recoveryCredentialsDTO);
    }


}