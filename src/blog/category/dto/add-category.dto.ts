import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class AddCategoryDTO {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    imageUrl: string = null;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsNumber()
    account: number;
}
