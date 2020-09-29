import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';

export class AddArticleDTO {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    summary?: string;

    @IsOptional()
    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    dateStart: string;

    @IsOptional()
    @IsString()
    dateEnd?: string;

    @IsOptional()
    @IsString()
    tags?: string[];

    @IsOptional()
    @IsBoolean()
    featured?: boolean;
    
    @IsNotEmpty()
    @IsNumber()
    account: number;

    @IsNotEmpty()
    @IsNumber()
    channel: number;

    @IsNotEmpty()
    @IsNumber()
    category: number;

    @IsOptional()
    @IsString()
    status?: string;
}
