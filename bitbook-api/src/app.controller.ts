import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

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
} 