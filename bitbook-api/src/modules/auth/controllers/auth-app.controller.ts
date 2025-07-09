import { Controller, Post, Body, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { AuthAppService } from '../services/auth-app.service';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { SetBiometricDto, BiometricLoginDto } from '../dto/biometric.dto';
import { LoginDto, RegisterDto, ForgotPasswordDto } from '../dto/auth.dto';
import { Access } from '../interfaces/access.interface';
import { LoginInfoInterceptor, LoginInfo } from '../interceptors/login-info.interceptor';

@Controller('auth')
@ApiTags('Autenticação App')
export class AuthAppController {
  constructor(private readonly authService: AuthAppService) { }

  @Post('login')
  @UseInterceptors(LoginInfoInterceptor)
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
  async login(@Body() payload: LoginDto, @Request() req): Promise<Access> {
    const { login, password } = payload;
    const loginInfo: LoginInfo = req.loginInfo;
    return this.authService.login(login, password, loginInfo);
  }

  @Post('register')
  @UseInterceptors(LoginInfoInterceptor)
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
  async register(@Body() payload: RegisterDto, @Request() req): Promise<Access> {
    const loginInfo: LoginInfo = req.loginInfo;
    return this.authService.register(payload, loginInfo);
  }

  @Post('forgot-password')
  @UseInterceptors(LoginInfoInterceptor)
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  @ApiResponse({ status: 200, description: 'E-mail enviado com instruções' })
  @ApiBadRequestResponse({ description: 'E-mail não encontrado' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() payload: ForgotPasswordDto, @Request() req) {
    const loginInfo: LoginInfo = req.loginInfo;
    return this.authService.forgotPassword(payload.login, loginInfo);
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(LoginInfoInterceptor)
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
    const loginInfo: LoginInfo = req.loginInfo;
    return this.authService.setBiometricSecret(req.user.sub, body.biometricSecret, loginInfo);
  }

  @Post('login/biometric')
  @UseInterceptors(LoginInfoInterceptor)
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
  async biometricLogin(@Body() body: BiometricLoginDto, @Request() req) {
    const loginInfo: LoginInfo = req.loginInfo;
    return this.authService.biometricLogin(body.biometricSecret, loginInfo);
  }
} 