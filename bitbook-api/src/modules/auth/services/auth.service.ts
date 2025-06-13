import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from 'typeorm';
import { compare, hash, genSalt } from 'bcrypt';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from 'src/modules/users/dto/user.dto';
import { User } from '../../users/entities/user.entity';
import { Access } from '../interfaces/access.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private UsersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async login(login: string, password: string): Promise<Access> {
    const user = await this.validateUser(login, password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id };
    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      user_id: user.id,
      access_token: {
        token,
        refresh_token: refreshToken,
        expiries: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      },
    };
  }

  async register(payload: CreateUserDto): Promise<Access> {
    const user = await this.UsersService.create(payload);

    const jwtPayload = { sub: user.id };
    const token = this.jwtService.sign(jwtPayload);
    const refreshToken = this.jwtService.sign(jwtPayload, { expiresIn: '7d' });

    return {
      user_id: user.id,
      access_token: {
        token,
        refresh_token: refreshToken,
        expiries: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      },
    };
  }

  async forgotPassword(login: string) {
    const user = await this.UsersService.findByLogin(login);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const salt = await genSalt(10);
    const resetToken = await hash(Math.random().toString(36), salt);

    // Aqui você pode salvar o token no banco ou enviar via email
    // Exemplo fictício:
    console.log(`Token de recuperação: ${resetToken}`);

    return {
      message: 'E-mail enviado com instruções para redefinir a senha',
    };
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

  async setBiometricSecret(userId: number, biometricSecret: string): Promise<{ message: string }> {
    const user = await this.UsersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const hashSecret = await hash(biometricSecret, 10);
    user.biometricSecretHash = hashSecret;
    user.isBiometricEnabled = true;
    await this.entityManager.save(User, user);

    return { message: 'Login biométrico ativado com sucesso' };
  }

  async biometricLogin(biometricSecret: string): Promise<{ access_token: string }> {
    const user = await this.UsersService.findOneByBiometric(biometricSecret);
    if (!user || !(await compare(biometricSecret, user.biometricSecretHash))) {
      throw new UnauthorizedException('Credenciais biométricas inválidas');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async socialLogin(socialUser: any) {
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
    return this.jwtService.sign(payload);
  }
}
