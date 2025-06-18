import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum FileType {
  IMAGE = 'image',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export class UploadFileDto {
  @IsNotEmpty()
  @IsString()
  folder: string;

  @IsNotEmpty()
  @IsEnum(FileType)
  type: FileType;
} 