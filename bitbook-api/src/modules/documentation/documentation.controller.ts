import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('summary')
export class DocumentationController {
  @Get()
  async getSummary(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'docs', 'index.html'));
  }
} 