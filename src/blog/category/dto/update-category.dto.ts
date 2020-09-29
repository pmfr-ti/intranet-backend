import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class UpdateCategoryDTO {

    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    status?: string;
}
