import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, genSalt } from 'bcrypt';
import { Inject } from '@nestjs/common';
import { UsersService } from 'src/modules/users/services/users.service';
import { CreateUserDto } from 'src/modules/users/dto/user.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { Access, AccessAdmin } from '../interfaces/access.interface';
import { UserRole } from 'src/modules/users/enums/user-role.enum';
import { EntityManager } from 'typeorm';

@Injectable()
export class AuthAdminService {
  constructor(
    @Inject(UsersService)
    private UsersService: UsersService,
    private jwtService: JwtService,
    private entityManager: EntityManager,
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

  // Métodos auxiliares
  private async validateUser(login: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.UsersService.findByLogin(login);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Acesso permitido apenas para administradores');
    }

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

    if (user.legacy) {
      await this.migrateLegacyUser(user.id, password);
    }

    return null;
  }

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
}


