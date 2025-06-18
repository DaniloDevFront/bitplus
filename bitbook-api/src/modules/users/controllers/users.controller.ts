import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, UploadedFiles, UploadedFile, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto, FindUserDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../../../core/jwt/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Usuários')
@Controller('users')
//@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  async create(@Body() payload: CreateUserDto) {
    return this.usersService.create(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados do usuário e perfil' })
  async update(
    @Param('id') id: number,
    @Body() payload: UpdateUserDto,
  ) {
    return this.usersService.update(id, payload);
  }

  @Put(':id/avatar')
  @ApiOperation({ summary: 'Atualizar avatar do usuário' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  async changeAvatar(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.changeAvatar(id, file);
  }

  @Put(':id/cover')
  @ApiOperation({ summary: 'Atualizar capa do usuário' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  async changeCover(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.changeCover(id, file);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar usuário' })
  async delete(@Param('id') id: number) {
    return this.usersService.delete(id);
  }

  @Get()

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuários' })
  async find(@Query() query: FindUserDto) {
    const { id, email, cpf, provider, role, premium } = query;

    if (id) return this.usersService.findById(id);
    if (email) return this.usersService.findByEmail(email);
    if (cpf) return this.usersService.findByCpf(cpf);
    if (provider) return this.usersService.findByProvider(provider);
    if (role) return this.usersService.findByRole(role);
    if (premium !== undefined) return this.usersService.findByPremium(premium);

    return this.usersService.findAll();
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Atualizar senha do usuário' })
  async changePassword(
    @Param('id') id: number,
    @Body() payload: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, payload);
  }
}
