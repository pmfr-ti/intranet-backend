import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class RecoveryCredentialsDTO {

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    newPassword: string;

    @IsOptional()
    @IsString()
    recoveryKey: string;
}
