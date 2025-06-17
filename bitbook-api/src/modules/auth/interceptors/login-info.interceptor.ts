import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export interface LoginInfo {
  ip_address?: string;
  user_agent?: string;
}

@Injectable()
export class LoginInfoInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Captura o IP do usuário
    const ip = this.getClientIp(request);

    // Captura o User-Agent
    const userAgent = request.headers['user-agent'];

    // Adiciona as informações ao request para uso posterior
    request['loginInfo'] = {
      ip_address: ip,
      user_agent: userAgent,
    };

    return next.handle();
  }

  private getClientIp(request: Request): string {
    // Tenta obter o IP real considerando proxies
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
} 