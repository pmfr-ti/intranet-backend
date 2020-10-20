import { IsString, IsOptional, IsNumber } from 'class-validator';

export class FindChannelDTO {

    @IsOptional()
    @IsNumber()
    id?: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    status?: string;
}