import { Module, forwardRef, HttpModule } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LdapService } from './ldap.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    forwardRef (() => AuthModule),
    HttpModule.register({
      timeout: 20000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AccountsController],
  exports: [
    AccountsService,
    LdapService,
  ],
  providers: [
    AccountsService,
    LdapService,
  ]
})
export class AccountsModule { }
