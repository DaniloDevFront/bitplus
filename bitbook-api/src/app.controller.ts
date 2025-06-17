import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
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
} 