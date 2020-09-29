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
    url_image?: string;

    @IsOptional()
    @IsString()
    status?: string;
}
