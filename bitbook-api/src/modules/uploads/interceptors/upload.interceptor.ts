import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileType } from '../dto/upload-file.dto';

@Injectable()
export class UploadInterceptor implements NestInterceptor {
  private readonly allowedMimeTypes = {
    [FileType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif'],
    [FileType.AUDIO]: ['audio/mpeg', 'audio/mp3'],
    [FileType.DOCUMENT]: ['application/pdf'],
  };

  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    const type = request.body.type;

    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('Arquivo muito grande. Tamanho máximo: 5MB');
    }

    if (!this.allowedMimeTypes[type].includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido para ${type}`,
      );
    }

    return next.handle();
  }
} 