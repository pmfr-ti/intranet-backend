import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDate } from 'class-validator';

export class AddFileDTO {

    @IsNotEmpty()
    @IsNumber()
    article: number;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsDate()
    postedAt: Date;

    @IsOptional()
    @IsString()
    url: string = null;

    @IsOptional()
    @IsNumber()
    size: string;

    @IsOptional()
    @IsString()
    status?: string;
}
