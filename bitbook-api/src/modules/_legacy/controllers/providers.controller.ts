import { Controller, Get } from '@nestjs/common';
import { ProvidersService } from '../services/providers.service';

@Controller('integrations/providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) { }

  @Get()
  async find() {
    return this.providersService.findAllProviders();
  }
} 