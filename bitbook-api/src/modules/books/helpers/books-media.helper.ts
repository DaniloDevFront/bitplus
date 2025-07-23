import { Injectable, BadRequestException } from '@nestjs/common';
import { UploadsService } from '../../uploads/uploads.service';
import { BooksMedia } from '../entities/books-media.entity';
import { ContentType } from '../interfaces/ebook.interface';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

interface ImageSizes {
  small: { width: number; height: number };
  medium: { width: number; height: number };
}

interface BookMediaResponse {
  img_small?: string;
  img_medium?: string;
  img_large?: string;
  file_url?: string;
  tracks?: { file_url: string }[];
}

@Injectable()
export class BooksMediaHelper {
  private readonly imageSizes: ImageSizes = {
    small: { width: 200, height: 300 },
    medium: { width: 400, height: 600 }
  };

  constructor(private readonly uploadsService: UploadsService) { }

  async processBookMedia(
    cover: Express.Multer.File | null,
    contentFile: Express.Multer.File | Express.Multer.File[],
    type: ContentType,
    file?: Express.Multer.File,
  ): Promise<BookMediaResponse> {
    const response: BookMediaResponse = {};

    // Processar capa se fornecida
    if (cover) {
      const originalUpload = await this.uploadsService.uploadFile(cover, 'books/covers', 'image');

      if (!originalUpload) {
        throw new Error('Falha ao fazer upload da imagem original');
      }

      // Processar a imagem original para gerar as versões menores
      const imageBuffer = cover.buffer;
      const [smallImage, mediumImage] = await Promise.all([
        this.resizeImage(imageBuffer, this.imageSizes.small.width, this.imageSizes.small.height),
        this.resizeImage(imageBuffer, this.imageSizes.medium.width, this.imageSizes.medium.height)
      ]);

      const [smallUpload, mediumUpload] = await Promise.all([
        this.uploadsService.uploadBuffer(smallImage, 'books/covers', 'image', 'small'),
        this.uploadsService.uploadBuffer(mediumImage, 'books/covers', 'image', 'medium')
      ]);

      if (!smallUpload || !mediumUpload) {
        throw new Error('Falha ao fazer upload das versões redimensionadas da imagem');
      }

      response.img_small = smallUpload.url;
      response.img_medium = mediumUpload.url;
      response.img_large = originalUpload.url;
    }

    // Processar conteúdo (PDF ou tracks de áudio)
    if (type === ContentType.EBOOK && contentFile) {
      // Para ebooks, contentFile é um único arquivo PDF
      const contentUpload = await this.uploadsService.uploadFile(contentFile as Express.Multer.File, 'books/files', 'document');

      if (!contentUpload) {
        throw new Error('Falha ao fazer upload do arquivo de conteúdo');
      }

      response.file_url = contentUpload.url;
    } else if (type === ContentType.AUDIOBOOK && Array.isArray(contentFile)) {
      // Para audiobooks, contentFile é um array de arquivos de áudio
      const trackUrls = await Promise.all(
        contentFile.map(async (track, index) => {
          const trackUpload = await this.uploadsService.uploadFile(track, 'books/tracks', 'audio');

          if (!trackUpload) {
            throw new Error(`Falha ao fazer upload da faixa ${index + 1}`);
          }

          return { file_url: trackUpload.url };
        })
      );

      response.tracks = trackUrls;
    } else if (type === ContentType.AMBOS) {
      // Para tipo AMBOS, processar tanto o arquivo quanto os tracks

      // Processar arquivo (PDF) se fornecido
      if (file) {
        const contentUpload = await this.uploadsService.uploadFile(file, 'books/files', 'document');

        if (!contentUpload) {
          throw new Error('Falha ao fazer upload do arquivo de conteúdo');
        }

        response.file_url = contentUpload.url;
      }

      // Processar tracks se fornecidos
      if (Array.isArray(contentFile) && contentFile.length > 0) {
        const trackUrls = await Promise.all(
          contentFile.map(async (track, index) => {
            const trackUpload = await this.uploadsService.uploadFile(track, 'books/tracks', 'audio');

            if (!trackUpload) {
              throw new Error(`Falha ao fazer upload da faixa ${index + 1}`);
            }

            return { file_url: trackUpload.url };
          })
        );

        response.tracks = trackUrls;
      }
    }

    return response;
  }

  async deleteBookMedia(media: BooksMedia): Promise<void> {
    const filesToDelete = [
      ...(media.file_url?.split(',') || []), // Split para lidar com múltiplas URLs de tracks
      media.img_small,
      media.img_medium,
      media.img_large
    ].filter(Boolean);

    await Promise.all(
      filesToDelete.map(file => this.uploadsService.deleteFile(file))
    );
  }

  async processTrackCover(file: Express.Multer.File): Promise<{
    cover_small: string;
    cover_medium: string;
    cover_large: string;
  }> {
    // Validar formato da imagem
    if (!file.mimetype.match(/^image\/(jpeg|png)$/)) {
      throw new BadRequestException('A imagem deve ser em formato JPEG ou PNG');
    }

    // Validar tamanho máximo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('A imagem não pode ter mais que 5MB');
    }

    // Gerar UUID para o nome do arquivo
    const uuid = uuidv4();
    const extension = file.originalname.split('.').pop();

    // Processar e fazer upload das versões redimensionadas
    const [smallBuffer, mediumBuffer, largeBuffer] = await Promise.all([
      this.resizeImage(file.buffer, 200, 200), // small: 200x200
      this.resizeImage(file.buffer, 400, 400), // medium: 400x400
      this.resizeImage(file.buffer, 800, 800)  // large: 800x800
    ]);

    const [smallResult, mediumResult, largeResult] = await Promise.all([
      this.uploadsService.uploadBuffer(smallBuffer, 'books/tracks/covers', 'image', `${uuid}_small`),
      this.uploadsService.uploadBuffer(mediumBuffer, 'books/tracks/covers', 'image', `${uuid}_medium`),
      this.uploadsService.uploadBuffer(largeBuffer, 'books/tracks/covers', 'image', `${uuid}_large`)
    ]);

    if (!smallResult || !mediumResult || !largeResult) {
      throw new BadRequestException('Erro ao fazer upload das imagens');
    }

    return {
      cover_small: smallResult.url,
      cover_medium: mediumResult.url,
      cover_large: largeResult.url
    };
  }

  private async resizeImage(
    buffer: Buffer,
    width: number,
    height: number
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();
  }
} 