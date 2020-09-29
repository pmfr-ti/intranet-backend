import { IsString, IsOptional, IsNumber } from 'class-validator';

export class FindArticleDTO {

    @IsOptional()
    @IsNumber()
    id?: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    status?: string;
}
