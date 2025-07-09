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
