import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from 'typeorm';
import { compare, hash, genSalt } from 'bcrypt';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UsersService } from '../../users/services/users.service';
import { LoginsLogsService } from '../../logs/services/logins-logs.service';
import { RegistrationsLogsService } from '../../logs/services/registrations-logs.service';
import { User } from '../../users/entities/user.entity';
import { Access } from '../interfaces/access.interface';
import { LOGIN_TYPE, LOGIN_STATUS } from '../../logs/enums/login.enum';
import { LoginInfo } from '../interceptors/login-info.interceptor';
import { RegisterDto } from '../dto/auth.dto';
import { ProvidersService } from 'src/modules/_legacy/services/providers.service';
import { EmailService } from '../../email/email.service';
import { generateSecurePassword } from '../../email/utils/password-generator.util';

@Injectable()
export class AuthAppService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private UsersService: UsersService,
    private loginLogsService: LoginsLogsService,
    private registrationsLogsService: RegistrationsLogsService,
    private jwtService: JwtService,
    private providersService: ProvidersService,
    private emailService: EmailService,
  ) { }

  async login(login: string, password: string, loginInfo?: LoginInfo): Promise<Access> {
    try {
      const user = await this.validateUser(login, password);

      if (!user) {
        // Registra tentativa de login falhada
        await this.logLoginAttempt(null, LOGIN_STATUS.FAILED, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo, 'Credenciais inválidas');
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Se o usuário é legacy e fez login com sucesso, migra para o novo formato
      if (user.legacy) {
        await this.migrateLegacyUser(user.id, password);
      }

      const payload = { sub: user.id };
      const token = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Registra login bem-sucedido
      await this.logLoginAttempt(user.id, LOGIN_STATUS.SUCCESS, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo);

      let provider = null;

      if (user.provider_id) {
        const response = await this.providersService.findProvider(user.provider_id)

        if (!response) {
          throw new NotFoundException('Erro ao buscar dados do provedor')
        }

        provider = response
      }

      return {
        user_id: user.id,
        premium: user.premium || false,
        provider: provider ? {
          id: provider.registro.id,
          name: provider.registro.nome,
          img_home: provider.registro.img_home || null,
        } : null,
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

  async register(payload: RegisterDto, loginInfo?: LoginInfo): Promise<Access> {
    try {
      const user = await this.UsersService.create(payload)

      const jwtPayload = { sub: user.id };
      const token = this.jwtService.sign(jwtPayload);
      const refreshToken = this.jwtService.sign(jwtPayload, { expiresIn: '7d' });

      // Registra sucesso no registro
      await this.logRegistrationAttempt(payload.email, loginInfo, undefined, 'success');

      // Registra login após registro
      await this.logLoginAttempt(user.id, LOGIN_STATUS.SUCCESS, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo, 'Login após registro');

      const response = await this.providersService.findProvider(user.provider_id)

      return {
        user_id: user.id,
        premium: user.premium || false,
        provider: response ? {
          id: response.id,
          name: response.nome,
          img_home: response.img_home || null,
        } : null,
        access_token: {
          token,
          refresh_token: refreshToken,
          expiries: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        },
      };
    } catch (error) {
      // Registra falha no registro
      await this.logRegistrationAttempt(payload.email, loginInfo, error.message, 'failed');
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

      // Gerar nova senha aleatória segura
      const newPassword = generateSecurePassword(12);

      // Hash da nova senha
      const hashedPassword = await hash(newPassword, 10);

      // Atualizar senha do usuário no banco
      await this.entityManager.update(User, user.id, {
        password: hashedPassword,
        legacy: false
      });

      // Enviar email com a nova senha
      const userName = user.profile?.name || user.email.split('@')[0];
      await this.emailService.sendPasswordResetEmail(user.email, newPassword, userName);

      // Registra tentativa de recuperação de senha
      await this.logLoginAttempt(user.id, LOGIN_STATUS.SUCCESS, LOGIN_TYPE.EMAIL_PASSWORD, loginInfo, 'Solicitação de recuperação de senha - nova senha enviada');

      return {
        message: 'Nova senha enviada para o seu e-mail',
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

    if (!user) {
      return null;
    }

    // Verifica se é um usuário legacy (vindo do Laravel)
    if (user.legacy) {
      const isValidLegacyPassword = await this.validateLegacyPassword(password, user.password);
      if (isValidLegacyPassword) {
        const { password, ...result } = user;
        return result;
      }
    } else {
      // Usuário novo - usa bcrypt padrão
      const isValidPassword = await compare(password, user.password);
      if (isValidPassword) {
        const { password, ...result } = user;
        return result;
      }
    }

    return null;
  }

  /**
 * Valida senha legacy do Laravel (bcrypt com formato $2y$)
 * O Laravel usa $2y$ enquanto o Node.js bcrypt usa $2a$ ou $2b$
 */
  private async validateLegacyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      // Verifica se o hash tem o formato do Laravel ($2y$)
      if (!hashedPassword.startsWith('$2y$')) {
        return false;
      }

      // Converte o formato $2y$ para $2a$ (compatível com bcrypt do Node.js)
      const convertedHash = hashedPassword.replace('$2y$', '$2a$');

      // Compara a senha com o hash convertido
      return await compare(password, convertedHash);
    } catch (error) {
      console.error('Erro ao validar senha legacy:', error);
      return false;
    }
  }

  /**
   * Migra usuário legacy para o novo formato de hash
   * Converte a senha do formato Laravel para o formato Node.js
   */
  private async migrateLegacyUser(userId: number, password: string): Promise<void> {
    try {
      // Gera novo hash no formato Node.js
      const newHash = await hash(password, 10);

      // Atualiza o usuário removendo a flag legacy e atualizando o hash
      await this.entityManager
        .createQueryBuilder()
        .update(User)
        .set({
          password: newHash,
          legacy: false
        })
        .where('id = :userId', { userId })
        .execute();
    } catch (error) {
      console.error(`Erro ao migrar usuário ${userId}:`, error);
      // Não lança erro para não interromper o login
    }
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
          premium: false,
          provider_id: undefined,
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
        user_id: userId || null, // null para tentativas sem usuário identificado
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
    failureReason?: string,
    status: 'success' | 'failed' = 'failed'
  ): Promise<void> {
    try {
      await this.registrationsLogsService.createLog({
        email,
        ip_address: loginInfo?.ip_address,
        user_agent: loginInfo?.user_agent,
        status,
        failure_reason: failureReason,
      });
    } catch (error) {
      // Não queremos que falhas no log afetem o fluxo principal
      console.error('Erro ao registrar log de registro:', error);
    }
  }
}
