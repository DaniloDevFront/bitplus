import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(UploadsService.name);

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    type: 'image' | 'audio' | 'document',
  ): Promise<{ url: string; fileName: string }> {
    let fileName: string;

    try {
      const fileExtension = path.extname(file.originalname);
      fileName = `${folder}/${uuidv4()}${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = `https://${this.configService.get('AWS_S3_BUCKET')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${fileName}`;

      return { url, fileName };
    } catch (error) {
      this.logger.error(`Erro ao fazer upload do arquivo: ${error.message}`);
      throw new Error('Falha ao fazer upload do arquivo');
    }
  }

  async deleteFile(fileUrlOrName: string): Promise<void> {
    try {
      let fileName: string;
      if (fileUrlOrName.startsWith('http')) {
        const url = new URL(fileUrlOrName);
        fileName = url.pathname.substring(1);
      } else {
        fileName = fileUrlOrName;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: fileName,
      });

      await this.s3Client.send(command);
      this.logger.log(`Arquivo deletado com sucesso: ${fileName}`);
    } catch (error) {
      this.logger.error(`Erro ao deletar arquivo: ${error.message}`);
      throw new Error('Falha ao deletar arquivo');
    }
  }

  async rollbackUpload(fileName: string): Promise<void> {
    try {
      await this.deleteFile(fileName);
      this.logger.log(`Upload rollback realizado com sucesso para o arquivo: ${fileName}`);
    } catch (error) {
      this.logger.error(`Erro ao realizar rollback do upload: ${error.message}`);
      throw new Error('Falha ao realizar rollback do upload');
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    type: string,
    suffix?: string
  ): Promise<{ url: string } | null> {
    try {
      const filename = `${Date.now()}-${suffix || 'file'}.jpg`;
      const path = `${folder}/${filename}`;

      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: path,
        Body: buffer,
        ContentType: 'image/jpeg'
      });

      await this.s3Client.send(command);

      return {
        url: `https://${this.configService.get('AWS_S3_BUCKET')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${path}`
      };
    } catch (error) {
      console.error('Erro ao fazer upload do buffer:', error);
      return null;
    }
  }
} 