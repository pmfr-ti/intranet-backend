import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { AddAccountDTO, UpdateAccountDTO, FindAccountDTO, AccountLdap } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private accountsRepository: Repository<Account>,
        private configService: ConfigService,
    ) {
    
    }

    async fetchAll(): Promise<Account[]> {
        return await this.accountsRepository.find({ status: 'ativo'});
    }

    async getByID(id: number): Promise<Account>{
        return await this.accountsRepository.findOne({ id });
    }

    async getByUsername(username: string): Promise<Account>{
        return await this.accountsRepository.findOne({ username });
    }

    async find(findAccountDTO: FindAccountDTO): Promise<Account>{
        return await this.accountsRepository.findOne({ where: findAccountDTO });
    }

    async addAccount(account: AddAccountDTO): Promise<Account> {

        const { username } = account;

        const isUsernameFound = await this.accountsRepository.findOne({ username });

        if (isUsernameFound) {
            throw new BadRequestException(`Usuário "${username}" já cadastrado`);
        }

        const newAccount = Object.assign(new Account(), account);

        return await this.accountsRepository.save(newAccount);
    }

    async updateAccount(account: UpdateAccountDTO): Promise<Account> {
        
        const id: number = account.id;

        const accountFound = await this.accountsRepository.findOne({ id });

        if (!accountFound) {
            throw new NotFoundException(`Conta com ID "${id}" não encontrada`);
        }

        const updatedAccount = Object.assign(accountFound, account);

        return await this.accountsRepository.save(updatedAccount);
    }

    async removeAccount(id: number): Promise<Account> {

        const accountFound = await this.accountsRepository.findOne({ id });

        if (!accountFound) {
            throw new NotFoundException(`Conta com ID "${id}" não encontrada`);
        }

        const newAccount = Object.assign(accountFound, {
            status: 'removido'
        });

        return await this.accountsRepository.save(newAccount);

    }

    async permanentlyDelete(id: number): Promise<any> {

        let accountFound = await this.accountsRepository.findOne({ id });

        if (!accountFound) {
            throw new NotFoundException(`Conta com ID "${id}" não encontrada`);
        }

        await this.accountsRepository.delete(id);

        accountFound = await this.accountsRepository.findOne({ id });

        if (accountFound) {
            return JSON.stringify({
                message: `Não foi possível deletar a conta com ID "${id}"`,
                type: 'error',
            });
        }

        return JSON.stringify({
            message: 'Deletado com sucesso',
            type: 'success',
        });

    }

    async getActiveUsername(username: string): Promise<Account>{
        
        return await this.accountsRepository.findOne({
            username, status: 'ativo' }
        );
    
    }
    
    async generateRecoveryKey(account: Account): Promise<string> {
        
        const recoveryKey = account.generateRecoveryKey();
        
        const updatedAccount = await this.accountsRepository.save(account);
        
        return updatedAccount ? recoveryKey : null;
        
    }    
    
    async verifyRecoveryKey(username: string, recoveryKey: string): Promise<Account>{
        
        const account = await this.accountsRepository.findOne({
            where:
                { username, status: 'ativo' }
        });

        if (!account) { return null; }

        return await account.compareRecoveryKey(recoveryKey) ? account : null;
    }

}
