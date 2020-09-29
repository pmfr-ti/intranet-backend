import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDate } from 'class-validator';

export interface AccountLdapModel {
    username: string;

    fullname: string;

    email?: string;

    phone?: string;

    positionHeld?: string;

    department?: string;

    office?: string;

    registrationNumber?: string;

    lastLogonAD?: Date;

    description: string;
}

export class AccountLdap implements AccountLdapModel {

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    fullname: string;

    @IsOptional()
    @IsEmail()
    email?: string = null;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    positionHeld?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsString()
    office?: string;

    @IsOptional()
    @IsString()
    registrationNumber?: string;

    @IsOptional()
    @IsDate()
    lastLogonAD?: Date;

    @IsNotEmpty()
    @IsString()
    description: string;

    constructor(initData: AccountLdapModel) {
        Object.assign(this, initData);
    }

    isActive(): boolean {
        return this.description === 'ativo';
    }
}

export class LdapDataDTO {

    ldapCredentials: string;

    search?: SearchDTO

    login?: LoginDTO

    changePassword?: LoginDTO
}

export class SearchDTO {

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

}

export class LoginDTO {

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
