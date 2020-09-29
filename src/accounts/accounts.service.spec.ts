import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Account } from './entities/account.entity'
import { AccountsService } from './accounts.service'

describe('AccountsService', () => {
    let service: AccountsService
    let repository: Repository<Account>
    
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AccountsService,
                {
                    provide: getRepositoryToken(Account),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        metadata: {
                            propertiesMap: {},
                        },
                    },
                },
            ],
        }).compile()

        service = module.get(AccountsService)
        repository = module.get(getRepositoryToken(Account))
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
        expect(repository).toBeDefined()
    })

    describe('create account', () => {
        it('should create account correctly', async function () {
            const account = {
                "username": "test",
                "email": "test@test.com",
                "password": "test",
                "fullname": "test",
                "level": "user"
            }
            await service.addAccount(account)

            expect(repository.save).toBeCalledWith(Object.assign(new Account(), account))
        })
    })

    describe('find account', () => {
        it('should find account correctly', async function () {
            const account = { email: 'test@test.com', username: 'test' }
            
            jest.spyOn(repository, 'findOne').mockResolvedValue(account as Account)
            
            const accountResult = await service.find({ username: account.username })

            expect(accountResult).toBe(account)
        
            expect(repository.findOne).toBeCalledWith({ where: { username: account.username } })
        })
    })
})