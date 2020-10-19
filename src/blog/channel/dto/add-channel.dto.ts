import { IsString, IsNotEmpty, IsOptional, isNotEmpty, IsNumber } from 'class-validator';

export class AddChannelDTO {

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
