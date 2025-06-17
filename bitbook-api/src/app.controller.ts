import { Controller, Get, HttpCode, HttpStatus, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {
  @Get()
  @HttpCode(HttpStatus.NOT_FOUND)
  getRoot(): object {
    return {
      message: 'Not Found',
      statusCode: 404
    };
  }

  @Get('summary')
  async getSummary(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'docs', 'index.html'));
  }

  @Get('summary/:path(*)')
  async getSummaryFile(@Param('path') path: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'docs', path);

    // Validação de segurança para evitar path traversal
    const normalizedPath = join(process.cwd(), 'docs', path).replace(/\\/g, '/');
    const docsPath = join(process.cwd(), 'docs').replace(/\\/g, '/');

    if (!normalizedPath.startsWith(docsPath)) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'Forbidden',
        statusCode: 403
      });
    }

    if (existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({
        message: 'File not found',
        error: 'Not Found',
        statusCode: 404
      });
    }
  }
} 