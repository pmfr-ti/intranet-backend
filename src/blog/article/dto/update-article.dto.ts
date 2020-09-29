import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateArticleDTO {

    @IsNotEmpty()
    @IsNumber()
    id: number;

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
    dateStart: Date;

    @IsOptional()
    @IsString()
    dateEnd?: Date;

    @IsOptional()
    @IsString()
    tags?: string[];

    @IsOptional()
    @IsString()
    url_image: string;

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
