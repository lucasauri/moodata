import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  IsEmail, IsNotEmpty, IsString, MinLength,
  MaxLength, IsIn, IsOptional,
} from 'class-validator';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

/** DTO para criação de usuário pelo painel admin (aceita role). */
class AdminCreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  @MaxLength(100)
  name: string;

  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(128)
  password: string;

  @IsString()
  @IsIn(['user', 'admin'], { message: 'Role inválido.' })
  role: 'user' | 'admin';

  @IsString()
  @IsOptional()
  @MaxLength(100)
  farmName?: string;
}

/**
 * Controller de administração — todas as rotas exigem role 'admin'.
 * A verificação é feita de forma declarativa pelo RolesGuard,
 * sem necessidade de if manuais dentro de cada método.
 */
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) { }

  /** Cria um usuário com role definido pelo admin */
  @Post('users')
  async createUser(@Body() dto: AdminCreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ForbiddenException('E-mail já está em uso.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        role: dto.role,
        farmName: dto.farmName ?? '',
      },
      select: {
        id: true, name: true, email: true,
        role: true, farmName: true, active: true, createdAt: true,
      },
    });

    return user;
  }

  /** Lista todos os usuários */
  @Get('users')
  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        farmName: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Alterna o status active de um usuário */
  @Patch('users/:id/toggle')
  async toggleUser(@Param('id') id: string, @Request() req: any) {
    if (req.user.sub === id) {
      throw new ForbiddenException('Você não pode bloquear a si mesmo.');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        farmName: true,
        active: true,
      },
    });
  }

  /** Remove um usuário */
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    if (req.user.sub === id) {
      throw new ForbiddenException('Você não pode remover a si mesmo.');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
