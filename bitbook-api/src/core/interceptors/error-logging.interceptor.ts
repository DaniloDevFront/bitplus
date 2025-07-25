import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';
import { ErrorsLogsService } from '../../modules/logs/services/errors-logs.service';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  constructor(private readonly errorsLogsService: ErrorsLogsService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const controller = context.getClass();

    return next.handle().pipe(
      catchError((error) => {
        // Loga o erro de forma assíncrona sem bloquear o fluxo
        this.logErrorAsync(error, request, controller, handler);

        // Re-lança o erro original imediatamente
        return throwError(() => error);
      }),
    );
  }

  private async logErrorAsync(
    error: any,
    request: Request,
    controller: any,
    handler: any
  ): Promise<void> {
    try {
      // Captura informações do erro
      const errorMessage = error.message || 'Erro desconhecido';
      const errorStack = error.stack;
      const errorType = error.constructor.name;

      // Captura informações da requisição
      const ip = this.getClientIp(request);
      const userAgent = request.headers['user-agent'];
      const userId = (request as any).user?.id;

      // Captura dados da requisição (sem informações sensíveis)
      const requestData = {
        method: request.method,
        url: request.url,
        body: this.sanitizeRequestBody(request.body),
        params: request.params,
        query: request.query,
      };

      // Determina a origem do erro
      const origin = `${controller.name}.${handler.name}`;

      // Loga o erro de forma assíncrona
      this.errorsLogsService.createLog({
        error_message: errorMessage,
        error_stack: errorStack,
        origin,
        error_type: errorType,
        ip_address: ip,
        user_agent: userAgent,
        user_id: userId,
        request_data: requestData,
      }).catch((logError) => {
        // Se falhar ao logar, apenas registra no console
        console.error('Erro ao salvar log de erro:', logError);
      });

    } catch (logError) {
      // Se falhar ao capturar informações, apenas registra no console
      console.error('Erro ao processar log de erro:', logError);
    }
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return request.ip || request.connection?.remoteAddress || 'unknown';
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };

    // Remove campos sensíveis
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
} 