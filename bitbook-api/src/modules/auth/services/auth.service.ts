import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from 'typeorm';
import { compare, hash, genSalt } from 'bcrypt';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UsersService } from '../../users/services/users.service';
import { LoginsLogsService } from '../../logs/services/logins-logs.service';
import { RegistrationsLogsService } from '../../logs/services/registrations-logs.service';
import { CreateUserDto } from 'src/modules/users/dto/user.dto';
import { User } from '../../users/entities/user.entity';
import { Access } from '../interfaces/access.interface';
import { LOGIN_TYPE, LOGIN_STATUS } from '../../logs/enums/login.enum';
import { LoginInfo } from '../interceptors/login-info.interceptor';

@Injectable()
export class AuthService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private UsersService: UsersService,
    private loginLogsService: LoginsLogsService,
    private registrationsLogsService: RegistrationsLogsService,
    private jwtService: JwtService,
  ) { }

  async login(login: string, password: string, loginInfo?: LoginInfo): Promise<Access> {
    try {
      const user = await this.validateUser(login, password);
      if (!user) {
        // Registra tentativa de login falhada
        await this.logLoginAttempt(null, LOGIN_STATUS.FAILED, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo, 'Credenciais inválidas');
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const payload = { sub: user.id };
      const token = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Registra login bem-sucedido
      await this.logLoginAttempt(user.id, LOGIN_STATUS.SUCCESS, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo);

      return {
        user_id: user.id,
        access_token: {
          token,
          refresh_token: refreshToken,
          expiries: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        },
      };
    } catch (error) {
      // Registra erro inesperado
      await this.logLoginAttempt(null, LOGIN_STATUS.FAILED, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo, error.message);
      throw error;
    }
  }

  async register(payload: CreateUserDto, loginInfo?: LoginInfo): Promise<Access> {
    try {
      // Registra tentativa de registro
      await this.logRegistrationAttempt(payload.email, loginInfo);

      const user = await this.UsersService.create(payload);

      const jwtPayload = { sub: user.id };
      const token = this.jwtService.sign(jwtPayload);
      const refreshToken = this.jwtService.sign(jwtPayload, { expiresIn: '7d' });

      // Registra login após registro
      await this.logLoginAttempt(user.id, LOGIN_STATUS.SUCCESS, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo, 'Login após registro');

      return {
        user_id: user.id,
        access_token: {
          token,
          refresh_token: refreshToken,
          expiries: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        },
      };
    } catch (error) {
      // Registra falha no registro
      await this.logRegistrationAttempt(payload.email, loginInfo, `Falha no registro: ${error.message}`);
      throw error;
    }
  }

  async forgotPassword(login: string, loginInfo?: LoginInfo) {
    try {
      const user = await this.UsersService.findByLogin(login);
      if (!user) {
        await this.logLoginAttempt(null, LOGIN_STATUS.FAILED, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo, 'Usuário não encontrado para recuperação de senha');
        throw new NotFoundException('Usuário não encontrado');
      }

      const salt = await genSalt(10);
      const resetToken = await hash(Math.random().toString(36), salt);

      // Aqui você pode salvar o token no banco ou enviar via email
      // Exemplo fictício:
      console.log(`Token de recuperação: ${resetToken}`);

      // Registra tentativa de recuperação de senha
      await this.logLoginAttempt(user.id, LOGIN_STATUS.SUCCESS, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo, 'Solicitação de recuperação de senha');

      return {
        message: 'E-mail enviado com instruções para redefinir a senha',
      };
    } catch (error) {
      await this.logLoginAttempt(null, LOGIN_STATUS.FAILED, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo, `Falha na recuperação de senha: ${error.message}`);
      throw error;
    }
  }

  async checkToken(token: string): Promise<{ status: string; error?: string }> {
    try {
      const payload = this.jwtService.verify(token);

      const user = await this.UsersService.findById(payload.sub);

      if (!user) {
        return {
          status: 'invalid',
          error: 'USER_NOT_FOUND'
        };
      }

      return { status: 'valid' };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          status: 'invalid',
          error: 'TOKEN_EXPIRED'
        };
      }

      return {
        status: 'invalid',
        error: 'INVALID_TOKEN'
      };
    }
  }

  // Métodos auxiliares
  private async validateUser(login: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.UsersService.findByLogin(login);

    if (user && (await compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async setBiometricSecret(userId: number, biometricSecret: string, loginInfo?: LoginInfo): Promise<{ message: string }> {
    try {
      const user = await this.UsersService.findById(userId);
      if (!user) {
        await this.logLoginAttempt(null, LOGIN_STATUS.FAILED, LOGIN_TYPE.BIOMETRIC, loginInfo, 'Usuário não encontrado para configuração biométrica');
        throw new NotFoundException('Usuário não encontrado');
      }

      const hashSecret = await hash(biometricSecret, 10);
      user.biometricSecretHash = hashSecret;
      user.isBiometricEnabled = true;
      await this.entityManager.save(User, user);

      // Registra configuração biométrica
      await this.logLoginAttempt(userId, LOGIN_STATUS.SUCCESS, LOGIN_TYPE.BIOMETRIC, loginInfo, 'Configuração biométrica ativada');

      return { message: 'Login biométrico ativado com sucesso' };
    } catch (error) {
      await this.logLoginAttempt(userId, LOGIN_STATUS.FAILED, LOGIN_TYPE.BIOMETRIC, loginInfo, `Falha na configuração biométrica: ${error.message}`);
      throw error;
    }
  }

  async biometricLogin(biometricSecret: string, loginInfo?: LoginInfo): Promise<{ access_token: string }> {
    try {
      const user = await this.UsersService.findOneByBiometric(biometricSecret);
      if (!user || !(await compare(biometricSecret, user.biometricSecretHash))) {
        await this.logLoginAttempt(null, LOGIN_STATUS.FAILED, LOGIN_TYPE.BIOMETRIC, loginInfo, 'Credenciais biométricas inválidas');
        throw new UnauthorizedException('Credenciais biométricas inválidas');
      }

      const payload = { sub: user.id, email: user.email };
      const token = this.jwtService.sign(payload);

      // Registra login biométrico bem-sucedido
      await this.logLoginAttempt(user.id, LOGIN_STATUS.SUCCESS, LOGIN_TYPE.BIOMETRIC, loginInfo);

      return {
        access_token: token,
      };
    } catch (error) {
      await this.logLoginAttempt(null, LOGIN_STATUS.FAILED, LOGIN_TYPE.BIOMETRIC, loginInfo, `Falha no login biométrico: ${error.message}`);
      throw error;
    }
  }

  async socialLogin(socialUser: any, loginInfo?: LoginInfo) {
    try {
      let user = await this.UsersService.findByEmail(socialUser.email);

      // Se não existir, cria um novo usuário
      if (!user) {
        const name = socialUser.firstName && socialUser.lastName
          ? `${socialUser.firstName} ${socialUser.lastName}`
          : socialUser.email.split('@')[0];

        user = await this.UsersService.create({
          email: socialUser.email,
          name,
          password: Math.random().toString(36).slice(-8),
          terms: true,
        });
      }

      // Gera o token JWT
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);

      // Registra login social bem-sucedido
      await this.logLoginAttempt(user.id, LOGIN_STATUS.SUCCESS, LOGIN_TYPE.SOCIAL, loginInfo);

      return token;
    } catch (error) {
      await this.logLoginAttempt(null, LOGIN_STATUS.FAILED, LOGIN_TYPE.SOCIAL, loginInfo, `Falha no login social: ${error.message}`);
      throw error;
    }
  }

  // Método auxiliar para registrar logs de login
  private async logLoginAttempt(
    userId: number | null,
    status: LOGIN_STATUS,
    loginType: LOGIN_TYPE,
    loginInfo?: LoginInfo,
    failureReason?: string
  ): Promise<void> {
    try {
      await this.loginLogsService.createLog({
        user_id: userId || 0, // 0 para tentativas sem usuário identificado
        login_at: new Date(),
        ip_address: loginInfo?.ip_address,
        user_agent: loginInfo?.user_agent,
        success: status,
        login_type: loginType,
        failure_reason: failureReason,
      });
    } catch (error) {
      // Não queremos que falhas no log afetem o fluxo principal
      console.error('Erro ao registrar log de login:', error);
    }
  }

  // Método auxiliar para registrar logs de registro
  private async logRegistrationAttempt(
    email: string,
    loginInfo?: LoginInfo,
    failureReason?: string
  ): Promise<void> {
    try {
      await this.registrationsLogsService.createLog({
        email,
        ip_address: loginInfo?.ip_address,
        user_agent: loginInfo?.user_agent,
        failure_reason: failureReason,
      });
    } catch (error) {
      // Não queremos que falhas no log afetem o fluxo principal
      console.error('Erro ao registrar log de registro:', error);
    }
  }
}
