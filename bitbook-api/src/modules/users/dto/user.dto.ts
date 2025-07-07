import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested, Matches, IsDate, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

export class LoginUserDto {
  @ApiProperty({ example: 'john@example.com ou 12345678900' })
  @Matches(/^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9]{11})$/, {
    message: 'O login deve ser um email válido ou um CPF com 11 dígitos'
  })
  login: string;

  @ApiProperty({ example: 'supersecret123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '(11) 99999-9999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiProperty({ example: '23/05/1996' })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  })
  birth_date?: string;

  @ApiProperty({ example: 'supersecret123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  terms: boolean;

  @ApiProperty({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  premium?: boolean;

  @ApiProperty({ example: 1, nullable: true, default: null })
  @IsOptional()
  @IsNumber()
  provider_id?: number;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  premium?: boolean;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiProperty({ example: '23/05/1996' })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Aceita tanto / quanto - como separador
    const separator = value.includes('/') ? '/' : '-';
    const [day, month, year] = value.split(separator);
    return `${year}-${month}-${day}`;
  })
  birth_date?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  cover?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiPropertyOptional({ example: '01/01/1990' })
  @IsString()
  @IsOptional()
  birth_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;
}

export class FindUserDto {
  @ApiPropertyOptional({ description: 'ID do usuário' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? Number(value) : undefined)
  id?: number;

  @ApiPropertyOptional({ description: 'Email do usuário' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'CPF do usuário' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ description: 'ID do provedor' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? Number(value) : undefined)
  provider?: number;

  @ApiPropertyOptional({ description: 'Papel do usuário', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Status premium do usuário' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  premium?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'senhaAntiga123' })
  @IsString()
  @IsNotEmpty()
  current_password: string;

  @ApiProperty({ example: 'novaSenha456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}

export class UpdateAvatarDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: Express.Multer.File;
}

export class UpdateCoverDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  cover: Express.Multer.File;
}