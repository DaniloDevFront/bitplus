import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { SetBiometricDto, BiometricLoginDto } from '../dto/biometric.dto';
import { LoginDto, RegisterDto, ForgotPasswordDto } from '../dto/auth.dto';
import { Access } from '../interfaces/access.interface';

@Controller('auth')
@ApiTags('Autenticação')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido',
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
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  @ApiBody({ type: LoginDto })
  async login(@Body() payload: LoginDto): Promise<Access> {
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

  @Post('set-biometric')
  //@UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ativar login biométrico' })
  @ApiResponse({
    status: 200,
    description: 'Login biométrico ativado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Login biométrico ativado com sucesso'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado' })
  @ApiBody({ type: SetBiometricDto })
  async setBiometric(@Request() req, @Body() body: SetBiometricDto) {
    return this.authService.setBiometricSecret(req.user.sub, body.biometricSecret);
  }

  @Post('login/biometric')
  @ApiOperation({ summary: 'Login com autenticação biométrica' })
  @ApiResponse({
    status: 200,
    description: 'Login biométrico realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Credenciais biométricas inválidas' })
  @ApiBody({ type: BiometricLoginDto })
  async biometricLogin(@Body() body: BiometricLoginDto) {
    return this.authService.biometricLogin(body.biometricSecret);
  }
} 