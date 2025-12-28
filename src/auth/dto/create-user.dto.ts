import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty() @IsString() nom: string;
  @IsNotEmpty() @IsString() prenom: string;
  @IsNotEmpty() @IsEmail() email: string;
  @IsNotEmpty() @MinLength(8) mot_de_passe: string;
  @IsOptional() @IsString() telephone?: string;
}
