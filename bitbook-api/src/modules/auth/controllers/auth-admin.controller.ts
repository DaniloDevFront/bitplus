import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/auth.dto';
import { AccessAdmin } from '../interfaces/access.interface';
import { AuthAdminService } from '../services/auth-admin.service';

@Controller('auth/admin')
@ApiTags('Autenticação Admin')
export class AuthAdminController {
  constructor(private readonly authService: AuthAdminService) { }

  @Post('login')
  @ApiOperation({ summary: 'Login do Administrador do sistema' })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido',
    type: 'object',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            role: { type: 'string' },
          }
        },
        access_token: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            refresh_token: { type: 'string' },
            expiries: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  @ApiBody({ type: LoginDto })
  async login(@Body() payload: LoginDto): Promise<AccessAdmin> {
    const { login, password } = payload;
    return this.authService.login(login, password);
  }
} 