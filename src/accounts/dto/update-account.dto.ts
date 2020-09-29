import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, IsDate } from 'class-validator';

export class UpdateAccountDTO {

    @IsNotEmpty()
    @IsNumber()
    id: number;

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
