import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddCategoryDTO {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    status?: string;
}
