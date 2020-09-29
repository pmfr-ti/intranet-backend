import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class FindFileDTO {

    @IsOptional()
    @IsNumber()
    id?: number;

    @IsOptional()
    @IsNumber()
    article?: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDate()
    postedAt?: Date;

    @IsOptional()
    @IsString()
    status?: string;
}
