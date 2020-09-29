import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class FindAccountDTO {

    @IsOptional()
    @IsNumber()
    id?: number;
    
    @IsOptional()
    @IsString()
    username?: string;

}
