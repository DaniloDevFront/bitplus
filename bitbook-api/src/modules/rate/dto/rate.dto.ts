import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRateDto {
  @ApiProperty({
    description: 'Nota da avaliação (1 a 5)',
    minimum: 1,
    maximum: 5,
    example: 5
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @ApiProperty({
    description: 'Comentário da avaliação (obrigatório quando a nota for menor ou igual a 3)',
    required: false,
    example: 'Muito bom atendimento!'
  })
  @ValidateIf((o) => o.rating <= 3)
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiPropertyOptional({
    description: 'ID do usuário que está fazendo a avaliação',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  user_id?: number;
}

export class UpdateRateDto {
  @ApiPropertyOptional({
    description: 'Nova nota da avaliação (1 a 5)',
    minimum: 1,
    maximum: 5,
    example: 4
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Novo comentário da avaliação (obrigatório quando a nota for menor ou igual a 3)',
    example: 'Atendimento melhorou bastante!'
  })
  @ValidateIf((o) => o.rating <= 3)
  @IsNotEmpty()
  @IsString()
  comment?: string;
}

export class FindRateDto {
  @ApiPropertyOptional({
    description: 'ID da avaliação',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @ApiPropertyOptional({
    description: 'ID do usuário',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  user_id?: number;

  @ApiPropertyOptional({
    description: 'Nota da avaliação (1 a 5)',
    minimum: 1,
    maximum: 5,
    example: 5
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Status da avaliação (true ou false)',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  status?: boolean;
} 