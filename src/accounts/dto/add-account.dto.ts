import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDate } from 'class-validator';

export class AddAccountDTO {

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsOptional()
    @IsDate()
    lastLoginDate?: Date;

    @IsOptional()
    @IsString()
    status: string
}
