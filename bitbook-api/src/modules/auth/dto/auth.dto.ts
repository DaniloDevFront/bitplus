import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, Matches, IsDate } from "class-validator";
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email ou CPF do usuário'
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+5511999999999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiProperty({ example: '23/05/1996' })
  @IsOptional()
  birth_date?: string;

  @ApiProperty({ example: 'supersecret123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  terms: boolean;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email ou CPF do usuário'
  })
  @IsString()
  @IsNotEmpty()
  login: string;
}