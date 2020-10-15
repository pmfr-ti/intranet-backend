import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
}
