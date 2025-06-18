import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto, RegisterDto, ForgotPasswordDto } from '../dto/auth.dto';
import { Access, AccessAdmin } from '../interfaces/access.interface';
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

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: 'object',
    schema: {
      properties: {
        user_id: { type: 'number' },
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
  @ApiBody({ type: RegisterDto })
  async register(@Body() payload: RegisterDto): Promise<Access> {
    return this.authService.register(payload);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  @ApiResponse({ status: 200, description: 'E-mail enviado com instruções' })
  @ApiBadRequestResponse({ description: 'E-mail não encontrado' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    return this.authService.forgotPassword(payload.login);
  }

  @Post('check-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar validade do token' })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'valid'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou expirado' })
  async checkToken(@Request() req) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return {
        status: 'invalid',
        error: 'TOKEN_NOT_FOUND'
      };
    }

    const token = authHeader.split(' ')[1];
    return this.authService.checkToken(token);
  }
} 