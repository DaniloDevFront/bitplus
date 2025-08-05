import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CheckUserPartnerDto {
  @IsString()
  @IsNotEmpty()
  chave: string;

  @IsString()
  @IsOptional()
  password?: string;
}

// Auth Partner Login type CPF
export class AuthPartnerCpfDto {
  @ApiProperty({
    example: '000.000.000-00',
    description: 'CPF no formato brasileiro (XXX.XXX.XXX-XX)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'O CPF deve estar no formato XXX.XXX.XXX-XX (exemplo: 000.000.000-00)'
  })
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  provider_id: number;
}


export class AuthPartnerExternalDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  provider_id: number;
}