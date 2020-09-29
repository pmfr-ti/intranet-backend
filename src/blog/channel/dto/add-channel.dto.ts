import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddChannelDTO {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    url_image: string = null;

    @IsOptional()
    @IsString()
    status?: string;
}
