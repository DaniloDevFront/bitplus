import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, genSalt } from 'bcrypt';
import { Inject } from '@nestjs/common';
import { UsersService } from 'src/modules/users/services/users.service';
import { CreateUserDto } from 'src/modules/users/dto/user.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { Access, AccessAdmin } from '../interfaces/access.interface';
import { UserRole } from 'src/modules/users/enums/user-role.enum';

@Injectable()
export class AuthAdminService {
  constructor(
    @Inject(UsersService)
    private UsersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async login(login: string, password: string): Promise<AccessAdmin> {
    const user = await this.validateUser(login, password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id };
    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        name: user.profile.name,
        role: user.role,
        avatar: user.profile.avatar,
      },
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

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Acesso permitido apenas para administradores');
    }

    if (await compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
}
