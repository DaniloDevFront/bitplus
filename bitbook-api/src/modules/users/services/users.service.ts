import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger, Provider } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { UserRole } from '../enums/user-role.enum';
import { ChangePasswordDto, CreateUserDto, CreateUserExternalDto, UpdateUserDto } from '../dto/user.dto';
import { UploadsService } from '../../uploads/uploads.service';
import { ProvidersService } from '../../_legacy/services/providers.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly uploadsService: UploadsService,
    private readonly providersService: ProvidersService,
  ) { }

  async create(payload: CreateUserDto): Promise<User> {
    const existingEmail = await this.findByEmail(payload.email);
    if (existingEmail) {
      throw new ConflictException('Email já está em uso');
    }

    const existingCpf = await this.findByCpf(payload.cpf);
    if (existingCpf) {
      throw new ConflictException('CPF já está em uso');
    }

    let premium = false;

    if (payload.provider_id) {
      const provider = await this.providersService.findProvider(payload.provider_id);

      if (!provider) {
        throw new BadRequestException('Provedor não encontrado');
      }

      premium = true;
    }

    const hashedPassword = await hash(payload.password, 10);

    const profile = this.entityManager.create(Profile, {
      name: payload.name,
      phone: payload.phone,
      cpf: payload.cpf,
      birth_date: payload.birth_date,
      provider_id: payload.provider_id,
    });

    const user = this.entityManager.create(User, {
      email: payload.email,
      password: hashedPassword,
      role: payload.role || UserRole.CLIENT,
      premium,
      terms: payload.terms,
      provider_id: payload.provider_id || null,
      subscription_id: payload.subscription_id || null,
      subscription_login: payload.subscription_login || null,
      profile,
    });

    return this.entityManager.save(User, user);
  }

  async createExternal(payload: CreateUserExternalDto): Promise<User> {
    const existingSubscriptionLogin = await this.findBySubscriptionLogin(payload.subscription_login);

    if (existingSubscriptionLogin) {
      throw new ConflictException('Usuário já existe');
    }

    const user = this.entityManager.create(User, {
      role: UserRole.CLIENT,
      premium: true,
      terms: true,
      provider_id: payload.provider_id,
      subscription_login: payload.subscription_login,
      subscription_id: payload.subscription_id,
    });

    const profile = this.entityManager.create(Profile, {
      name: null,
      phone: null,
      cpf: null,
      birth_date: null,
    });

    user.profile = profile;

    return this.entityManager.save(User, user);
  }

  async update(id: number, payload: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (payload.email) {
      user.email = payload.email;
    }

    if (payload.role) {
      user.role = payload.role;
    }

    if (payload.premium) {
      user.premium = payload.premium;
    }

    if (payload.provider_id) {
      user.provider_id = payload.provider_id;
    }

    if (payload.subscription_id) {
      user.subscription_id = payload.subscription_id;
    }

    if (payload.subscription_login) {
      user.subscription_login = payload.subscription_login;
    }

    // Atualiza dados do profile, se enviados
    if (payload.profile) {
      const profile = user.profile || this.entityManager.create(Profile, {});

      if (payload.profile.name) {
        profile.name = payload.profile.name;
      }
      if (payload.profile.phone) {
        profile.phone = payload.profile.phone;
      }

      if (payload.profile.cpf) {
        if (user.provider_id) {
          throw new BadRequestException('Não é possível atualizar o CPF de um usuário vinculado a um provedor');
        }
        profile.cpf = payload.profile.cpf;
      }
      if (payload.profile.birth_date) {
        profile.birth_date = payload.profile.birth_date;
      }
      if (payload.profile.avatar) {
        profile.avatar = payload.profile.avatar;
      }
      if (payload.profile.cover) {
        profile.cover = payload.profile.cover;
      }

      user.profile = profile;
    }

    await this.entityManager.save(User, user);

    return user;
  }

  async delete(id: number): Promise<{ success: boolean; message: string; deleted_at: string }> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Deleta os arquivos do S3 antes de remover o usuário
    if (user.profile) {
      if (user.profile.avatar) {
        if (!user.profile.avatar.includes('default')) {
          await this.uploadsService.deleteFile(user.profile.avatar);
        }
      }
      if (user.profile.cover) {
        if (!user.profile.cover.includes('default')) {
          await this.uploadsService.deleteFile(user.profile.cover);
        }
      }
    }

    await this.entityManager.remove(user);

    return {
      success: true,
      message: `Usuário com ID ${id} removido com sucesso`,
      deleted_at: new Date().toISOString()
    };
  }

  async findAll(): Promise<User[]> {
    return this.entityManager.find(User, {
      relations: ['profile'],
    });
  }

  async findById(id: number): Promise<User & { provider: any }> {
    const user = await this.entityManager.findOne(User, {
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const provider = await this.providersService.findProvider(user.provider_id);

    return {
      ...user,
      provider: provider ? {
        id: provider.registro.id,
        name: provider.registro.nome,
        media: {
          small: provider.registro.img || null,
          large: provider.registro.img_grande || null,
          list: provider.registro.img_lista || null,
          home: provider.registro.img_home || null,
        },
        method: provider.registro.campo_vinculacao === "subscriberId" ? "login" : "cpf",
      } : null,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.entityManager.findOne(User, {
      where: { email },
      relations: ['profile'],
    });
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const response = await this.entityManager.findOne(User, {
      where: { profile: { cpf } },
      relations: ['profile'],
    });
    return response
  }

  async findBySubscriptionLogin(subscription_login: string): Promise<User | null> {
    const response = await this.entityManager.findOne(User, {
      where: { subscription_login: subscription_login },
    })

    return response
  }

  async findByProvider(provider: number): Promise<User[]> {
    return this.entityManager.find(User, {
      where: { provider_id: Number(provider) },
      relations: ['profile'],
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.entityManager.find(User, {
      where: { role },
      relations: ['profile'],
    });
  }

  async findByPremium(premium: boolean): Promise<User[]> {
    return this.entityManager.find(User, {
      where: { premium },
      relations: ['profile'],
    });
  }

  async changePassword(id: number, payload: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isMatch = await compare(payload.current_password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Senha atual incorreta');
    }

    user.password = await hash(payload.new_password, 10);

    await this.entityManager.save(User, user);
    return { message: 'Senha atualizada com sucesso' };
  }

  async changeAvatar(id: number, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    try {
      const uploadResult = await this.uploadsService.uploadFile(file, 'profiles/avatares', 'image');

      // ao retornar o upload, deleta o arquivo antigo se houver
      if (uploadResult && user.profile.avatar) {
        if (!user.profile.avatar.includes('default')) {
          await this.uploadsService.deleteFile(user.profile.avatar);
        }
      }

      user.profile.avatar = uploadResult.url;

      await this.entityManager.save(User, user);
      return user;
    } catch (error) {
      this.logger.error(`Erro ao atualizar avatar: ${error.message}`);
      throw new BadRequestException('Erro ao atualizar avatar: ' + error.message);
    }
  }

  async changeCover(id: number, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    try {
      const uploadResult = await this.uploadsService.uploadFile(file, 'profiles/covers', 'image');

      if (uploadResult && user.profile.cover) {
        if (!user.profile.cover.includes('default')) {
          await this.uploadsService.deleteFile(user.profile.cover);
        }
      }

      user.profile.cover = uploadResult.url;

      await this.entityManager.save(User, user);
      return user;
    } catch (error) {
      this.logger.error(`Erro ao atualizar capa: ${error.message}`);
      throw new BadRequestException('Erro ao atualizar capa: ' + error.message);
    }
  }

  // Métodos auxiliares
  async findOneByBiometric(biometricSecret: string): Promise<User | null> {
    return this.entityManager.findOne(User, {
      where: { isBiometricEnabled: true },
      relations: ['profile'],
    });
  }

  async findByLogin(login: string): Promise<User | null> {
    // Verifica se o login é um email ou CPF
    const isEmail = login.includes('@');

    if (isEmail) {
      return this.entityManager.findOne(User, {
        where: { email: login },
        relations: ['profile'],
      });
    } else {
      return this.entityManager.findOne(User, {
        relations: ['profile'],
        where: {
          profile: {
            cpf: login
          }
        }
      });
    }
  }
}
