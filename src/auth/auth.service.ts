import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Account } from 'src/accounts/entities/account.entity';
import { AccountsService } from 'src/accounts/accounts.service';
import { LdapService } from 'src/accounts/ldap.service';
import { CredentialsDTO, AuthDTO, RecoveryCredentialsDTO } from './dto';
import { AccountLdap, AddAccountDTO } from 'src/accounts/dto';
import * as moment from 'moment';

@Injectable()
export class AuthService {

    constructor(
        private configService: ConfigService,
        public jwtService: JwtService,
        private accountService: AccountsService,
        private ldapService: LdapService,
        private mailerService: MailerService,
    ) {
        
    }

    async login(credentials: CredentialsDTO): Promise<string> {

        const { username, password, rememberMe } = credentials;
               
        const accountAD = await this.ldapService.login(username, password);

        const account: Account = await this.accountService.getByUsername(username);

        if (!account) {
            
            const addAccount: AddAccountDTO = Object.assign(new AddAccountDTO, {
                username: accountAD.username,
                lastLoginDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                status: accountAD.isActive() ? 'ativo' : 'desativado'
            });

            const newAccount = await this.accountService.addAccount(addAccount);

            if (!newAccount) {
                throw new UnauthorizedException({
                    statusCode: 401,
                    type: "Unauthorized",
                    message: "Não foi possível criar a conta"
                });
            }

            if (!newAccount.isActive()) {
                throw new UnauthorizedException({
                    statusCode: 401,
                    type: "Unauthorized",
                    message: "Seu usuário não está regularizado. Contate a Diretoria de TI para mais informações."
                });
            }

            return this.createToken(newAccount, accountAD, rememberMe);

        }

        const accountToUpdate: Account = Object.assign(account, {
            lastLoginDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            status: accountAD.isActive() ? "ativo" : "desativado",
        })

        const updatedAccount = await this.accountService.updateAccount(accountToUpdate);

        if (!updatedAccount) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Não foi possível atualizar a conta"
            });
        }

        if (!updatedAccount.isActive()) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Seu usuário não está regularizado. Contate a Diretoria de TI para mais informações."
            });
        }

        return this.createToken(updatedAccount, accountAD, rememberMe);
    }

    async refresh(expiredToken: string): Promise<string> {

        const payload: AuthDTO = new AuthDTO(this.jwtService.decode(expiredToken) as AuthDTO);

        if (!payload) {
            throw new BadRequestException();
        }

        const accountAD = await this.ldapService.searchByUsername(payload.username);

        const account = await this.accountService.getActiveUsername(payload.username);

        const accountToUpdate: Account = Object.assign(account, {
            status: accountAD.isActive() ? "ativo" : "desativado",
        })

        const updatedAccount = await this.accountService.updateAccount(accountToUpdate);

        if (!updatedAccount) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Não foi possível logar"
            });
        }

        if (!updatedAccount.isActive()) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Invalid username"
            });
        }

        if (!payload.isAllowToRenewal()) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Invalid Token"
            });
        }

        return this.createToken(updatedAccount, accountAD, payload.remember);

    }

    async verify(token: string): Promise<any> {

        const payload: AuthDTO = new AuthDTO(this.jwtService.decode(token) as AuthDTO);

        if (!payload) {
            throw new BadRequestException();
        }

        const accountAD = await this.ldapService.searchByUsername(payload.username);

        const account: Account = await this.accountService.getActiveUsername(payload.username);

        if (!account || !accountAD.isActive()) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Seu usuário não está regularizado. Contate a Diretoria de TI para mais informações."
            });
        }

        if (!payload.isAllowToRenewal()) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Invalid Token"
            });
        }

        return JSON.stringify({
            type: 'success',
            message: 'Token valid',
        });
    }


    async sendRecoveryKey(username: string): Promise<any> {
        
        const accountAD = await this.ldapService.searchByUsername(username);
        
        if (!accountAD) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Não foi possível encontrar a conta"
            });
        }

        let account: Account = await this.accountService.getActiveUsername(username);
        
        if (!account) {
        
            const addAccount: AddAccountDTO = Object.assign(new AddAccountDTO, {
                username: accountAD.username,
                status: accountAD.isActive() ? 'ativo' : 'desativado'
            });
        
            const newAccount = await this.accountService.addAccount(addAccount);

            if (!newAccount) {
                throw new UnauthorizedException({
                    statusCode: 401,
                    type: "Unauthorized",
                    message: "Não foi possível encontrar a conta"
                });
            }
        
            account = newAccount;
        }
        
        const updatedAccount: Account = Object.assign(account, {
            status: accountAD.isActive() ? "ativo" : "desativado",
        })
        
        if (!accountAD.isActive()) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Seu usuário não está regularizado. Contate a Diretoria de TI para mais informações."
            });
        }
        
        if (!accountAD.email) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Usuário não possui email cadastrado no sistema"
            });
        }
        
        const recoveryKey = await this.accountService.generateRecoveryKey(updatedAccount);

        if (!recoveryKey) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Não foi possível gerar uma chave de recuperação"
            });
        }
        
        const mail = {
            to: accountAD.email,
            from: 'noreply@application.com',
            subject: 'PMFR | Recuperação de Senha',
            template: 'recover-password',
            context: {
                currentTime: `${moment().format('DD/MM/YYYY HH:mm:ss')}`,
                recoveryKey: recoveryKey,
                fullname: accountAD.fullname
            },
        }

        await this.mailerService.sendMail(mail);

        return updatedAccount;
    }

    async loginRecoveryKey(recoveryCredentials: RecoveryCredentialsDTO): Promise<string> {
        const { username, newPassword, recoveryKey } = recoveryCredentials;

        const account: Account = await this.accountService.verifyRecoveryKey(username, recoveryKey);

        if (!account) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Usuário e/ou código de recuperação inválido(s)"
            });
        }

        const accountAD = await this.ldapService.changePassword(username, newPassword);

        if (!accountAD) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Usuário e/ou código de recuperação inválido(s)"
            });
        }

        const accountToUpdate: Account = Object.assign(account, {
            lastLoginDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            recoveryKey: null,
            status: accountAD.isActive() ? "ativo" : "desativado",
        })

        const updatedAccount = await this.accountService.updateAccount(accountToUpdate);

        if (!updatedAccount) {
            throw new UnauthorizedException({
                statusCode: 401,
                type: "Unauthorized",
                message: "Não foi possível logar"
            });
        }

        if (accountAD.email) {
            const mail = {
                to: accountAD.email,
                from: 'noreply@application.com',
                subject: 'PMFR | Alerta de solicitação para alteração de senha',
                template: 'login-recover',
                context: {
                    appName: 'Sistema',
                    currentTime: `${moment().format('DD/MM/YYYY HH:mm:ss')}`,
                    fullname: accountAD.fullname
                },
            }
    
            await this.mailerService.sendMail(mail);
        }        

        return this.createToken(updatedAccount, accountAD);
    }

    createToken(account: Account, accountAD: AccountLdap, rememberMe = false): string {
        const rnwTimestamp = this.createRenewalTime(rememberMe);

        const token = this.jwtService.sign({
            id: account.id,
            username: accountAD.username,
            fullname: accountAD.fullname,
            email: accountAD.email,
            remember: rememberMe,
            rnw: rnwTimestamp
        });

        return token;
    }

    createRenewalTime(rememberMe = false): number {
        // create a utc date
        const rnw = moment();

        const renewalTimeOption = rememberMe ? 'jwtRenewalTimeLong' : 'jwtRenewalTimeDefault';

        const renewalTimeValue = this.configService.get(renewalTimeOption);

        rnw.add(renewalTimeValue, 's');

        // return a timestamp value
        return rnw.unix();
    }

    extractJWT(bearerToken: string): string {
        const token: string = bearerToken.split(' ')[1];
        return token;
    }


}
