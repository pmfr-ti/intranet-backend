import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class UpdateChannelDTO {

    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    imageUrl: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsNumber()
    account: number;
}
